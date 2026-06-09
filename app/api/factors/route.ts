import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function inferActivityType(name: string, unit: string) {
  const normalizedName = name.toLowerCase();
  const normalizedUnit = unit.replace(/\s+/g, '').toLowerCase();

  if (
    normalizedUnit.includes('kwh') ||
    normalizedName.includes('전기') ||
    normalizedName.includes('한국전력')
  ) {
    return '전기';
  }
  if (
    normalizedUnit.includes('ton-km') ||
    normalizedUnit.includes('tonkm') ||
    normalizedName.includes('운송') ||
    normalizedName.includes('트럭')
  ) {
    return '운송';
  }
  if (
    normalizedUnit.includes('kg') ||
    normalizedName.includes('플라스틱') ||
    normalizedName.includes('알루미늄')
  ) {
    return '원소재';
  }

  return name;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const all = url.searchParams.get('all') === 'true';

  let query = supabase
    .from('emission_factors')
    .select('*')
    .order('valid_from', { ascending: false });

  if (!all) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];

  if (all) {
    const names: string[] = [];
    const groups: (typeof rows)[] = [];

    for (let i = 0; i < rows.length; i++) {
      const factor = rows[i];
      const idx = names.indexOf(factor.name);
      if (idx === -1) {
        names.push(factor.name);
        groups.push([factor]);
      } else {
        groups[idx].push(factor);
      }
    }

    const result: Record<string, typeof rows> = {};
    for (let i = 0; i < names.length; i++) {
      result[names[i]] = groups[i];
    }
    return NextResponse.json(result);
  }

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = body.name;
  const scope = body.scope;
  const factor_value = body.factor_value;
  const unit = body.unit;
  const rawActivityType = String(body.activity_type ?? '').trim();
  const activity_type =
    rawActivityType || inferActivityType(String(name), String(unit));
  const version = body.version;
  const valid_from = body.valid_from;
  // 클라가 명시 안 하면 기본 true (기존 동작 유지)
  const isActive = body.is_active !== false;

  // 바로 적용일 때만 같은 name 의 기존 active 비활성화
  if (isActive) {
    const deactivateRes = await supabase
      .from('emission_factors')
      .update({ is_active: false })
      .eq('name', name)
      .eq('is_active', true);

    if (deactivateRes.error) {
      return NextResponse.json(
        { error: deactivateRes.error.message },
        { status: 500 },
      );
    }
  }

  const insertRes = await supabase
    .from('emission_factors')
    .insert({
      name: name,
      activity_type: activity_type,
      scope: scope,
      factor_value: factor_value,
      unit: unit,
      version: version,
      valid_from: valid_from,
      is_active: isActive,
    })
    .select()
    .single();

  if (insertRes.error) {
    return NextResponse.json(
      { error: insertRes.error.message },
      { status: 500 },
    );
  }
  return NextResponse.json(insertRes.data, { status: 201 });
}
