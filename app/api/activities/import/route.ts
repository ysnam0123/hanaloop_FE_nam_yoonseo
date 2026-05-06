import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

// 엑셀 임포트 도전..!
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

  const factorsRes = await supabase
    .from('emission_factors')
    .select('id, name, factor_value')
    .eq('is_active', true);
  const factors = factorsRes.data ?? [];

  const inserted: unknown[] = [];
  const errors: unknown[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const date = row['일자(원본)'] as string;
    const type = row['활동 유형'] as string;
    const description = row['설명'] as string;
    const amount = Number(row['량']);
    const unit = row['단위'] as string;

    // 공백/대소문자 차이로 매칭 놓치지 않도록 정규화 후 부분 문자열 비교
    const desc = (description ?? '').replace(/\s+/g, '').toLowerCase();
    let factor: { id: string; name: string; factor_value: number } | null =
      null;
    for (let j = 0; j < factors.length; j++) {
      const f = factors[j];
      const fname = (f.name ?? '').replace(/\s+/g, '').toLowerCase();
      if (fname.includes(desc) || desc.includes(fname)) {
        factor = f;
        break;
      }
    }

    if (!factor) {
      errors.push({
        row: i + 2,
        date: date,
        type: type,
        description: description,
        amount: amount,
        unit: unit,
        reason: '배출계수 매핑 실패',
      });
      continue;
    }

    const insertRes = await supabase
      .from('activities')
      .insert({
        date: date,
        type: type,
        description: description,
        amount: amount,
        unit: unit,
        factor_id: factor.id,
        factor_value_snapshot: factor.factor_value,
      })
      .select()
      .single();

    if (insertRes.error) {
      errors.push({
        row: i + 2,
        date: date,
        type: type,
        description: description,
        amount: amount,
        unit: unit,
        reason: insertRes.error.message,
      });
    } else {
      inserted.push(insertRes.data);
    }
  }

  return NextResponse.json({ inserted: inserted.length, errors: errors });
}
