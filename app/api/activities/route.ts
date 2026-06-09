import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calcEmission } from '@/lib/calculations';

function getNextMonth(month: string) {
  const [yearPart, monthPart] = month.split('-');
  const year = Number(yearPart);
  const monthNumber = Number(monthPart);

  if (!year || !monthNumber || monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  if (monthNumber === 12) {
    return `${year + 1}-01`;
  }

  return `${year}-${String(monthNumber + 1).padStart(2, '0')}`;
}

// 활동 목록 조회
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const year = url.searchParams.get('year');
  const month = url.searchParams.get('month');
  const site = url.searchParams.get('site');
  const type = url.searchParams.get('type');

  let query = supabase
    .from('activities')
    .select('*, emission_factors(name, scope, unit)')
    .order('date', { ascending: true });

  // month 가 있으면 month 우선 (이미 yyyy-mm 으로 year 포함), 없으면 year 단위로 필터
  if (month) {
    const nextMonth = getNextMonth(month);

    if (!nextMonth) {
      return NextResponse.json(
        { message: '잘못된 월 형식입니다.' },
        { status: 400 },
      );
    }

    query = query.gte('date', `${month}-01`).lt('date', `${nextMonth}-01`);
  } else if (year) {
    query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
  }
  if (type) {
    query = query.eq('type', type);
  }
  if (site) {
    query = query.eq('site', site);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];

  // 중복 정의: date + site + type + description 넷이 모두 같은 행이 2건 이상이면 중복
  const keys: string[] = [];
  const counts: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const key =
      rows[i].date +
      '__' +
      rows[i].site +
      '__' +
      rows[i].type +
      '__' +
      rows[i].description;
    const idx = keys.indexOf(key);
    if (idx === -1) {
      keys.push(key);
      counts.push(1);
    } else {
      counts[idx] = counts[idx] + 1;
    }
  }

  const result: unknown[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const key =
      row.date +
      '__' +
      row.site +
      '__' +
      row.type +
      '__' +
      row.description;
    const count = counts[keys.indexOf(key)];

    result.push({
      ...row,
      emission: calcEmission(row.amount, row.factor_value_snapshot),
      is_duplicate: count > 1,
    });
  }

  return NextResponse.json(result);
}

// 활동 목록 추가
export async function POST(request: NextRequest) {
  const body = await request.json();
  const date = body.date;
  const site = body.site ?? '본사';
  const type = body.type;
  const description = body.description;
  const amount = body.amount;
  const unit = body.unit;
  const factor_id = body.factor_id;

  if (!factor_id) {
    return NextResponse.json(
      {
        message:
          '배출계수가 등록되지 않은 항목입니다. 배출계수 탭에서 먼저 등록해주세요.',
      },
      { status: 400 },
    );
  }

  const factorRes = await supabase
    .from('emission_factors')
    .select('factor_value')
    .eq('id', factor_id)
    .single();

  if (factorRes.error || !factorRes.data) {
    return NextResponse.json(
      { message: '배출계수를 찾을 수 없습니다.' },
      { status: 404 },
    );
  }

  const insertRes = await supabase
    .from('activities')
    .insert({
      date: date,
      site: site,
      type: type,
      description: description,
      amount: amount,
      unit: unit,
      factor_id: factor_id,
      factor_value_snapshot: factorRes.data.factor_value,
    })
    .select('*, emission_factors(name, scope, unit)')
    .single();

  if (insertRes.error) {
    return NextResponse.json(
      { error: insertRes.error.message },
      { status: 500 },
    );
  }

  const inserted = insertRes.data;

  // 중복 정의: date + site + type + description 넷이 모두 같은 행이 본인 포함 2건 이상이면 중복
  const siblingsRes = await supabase
    .from('activities')
    .select('id')
    .eq('date', inserted.date)
    .eq('site', inserted.site)
    .eq('type', inserted.type)
    .eq('description', inserted.description);

  const siblingsCount = siblingsRes.data ? siblingsRes.data.length : 0;

  return NextResponse.json(
    {
      ...inserted,
      emission: calcEmission(inserted.amount, inserted.factor_value_snapshot),
      is_duplicate: siblingsCount > 1,
    },
    { status: 201 },
  );
}
