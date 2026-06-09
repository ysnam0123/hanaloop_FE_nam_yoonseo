import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

// 엑셀 임포트 도전..!
export async function POST(request: NextRequest) {
  // request.json 으로는 파일을 보낼 수 없다.
  // fromData() 로만 주고받을 수 있음
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  }

  // =================================================================================
  // 엑셀 파싱 - 실제 파일 내용을 arrayBuffer로 꺼낸다 -> xlsx 라이브러리가 이걸 입력으로 받음
  const buffer = await file.arrayBuffer();

  // xlsx.read 로 워크북 파싱 -> 엑셀 파일을 workbook 객체로 파싱.
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // 첫번째 시트만 사용
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  //  시트를 JSON 배열로 변환. 첫번째 행을 자동으로 헤더로 인식해서, 나머지 행을 객체배열로 만든다.
  const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
  // =================================================================================
  // 배출계수 미리 가져오기 (현재 적용중인 계수만 매칭 대상)
  const factorsRes = await supabase
    .from('emission_factors')
    .select('id, name, activity_type, factor_value')
    .eq('is_active', true);
  const factors = factorsRes.data ?? [];

  // 결과 컨테이너
  const inserted: unknown[] = [];
  const errors: unknown[] = [];

  // 메인 루프 - 한행씩 처리
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // 헤더 고정이라 직접 접근
    const date = row['일자(원본)'] as string;
    const site = (row['사업장'] as string) || '본사';
    const type = row['활동 유형'] as string;
    const description = row['설명'] as string;
    // 숫자로 다 전달되진 않는다.
    const amount = Number(row['량']);
    const unit = row['단위'] as string;

    // 공백/대소문자 차이로 매칭 놓치지 않도록 정규화 후 부분 문자열 비교
    const desc = (description ?? '').replace(/\s+/g, '').toLowerCase();
    let factor: {
      id: string;
      name: string;
      activity_type?: string;
      factor_value: number;
    } | null = null;
    for (let j = 0; j < factors.length; j++) {
      const f = factors[j];
      const fname = (f.name ?? '').replace(/\s+/g, '').toLowerCase();
      const ftype = (f.activity_type ?? '').replace(/\s+/g, '').toLowerCase();
      const rowType = (type ?? '').replace(/\s+/g, '').toLowerCase();
      if (
        (rowType && ftype === rowType) ||
        fname.includes(desc) ||
        desc.includes(fname)
      ) {
        factor = f;
        break;
      }
    }

    if (!factor) {
      errors.push({
        row: i + 2,
        date: date,
        site: site,
        type: type,
        description: description,
        amount: amount,
        unit: unit,
        reason: '배출계수 매핑 실패',
      });
      continue;
    }

    // insert 시도
    const insertRes = await supabase
      .from('activities')
      .insert({
        date: date,
        site: site,
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
        site: site,
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

  // 최종 응답
  return NextResponse.json({ inserted: inserted.length, errors: errors });
}
