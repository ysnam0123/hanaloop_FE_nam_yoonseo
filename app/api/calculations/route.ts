import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function sumEmission(
  rows: { amount: number; factor_value_snapshot: number }[],
) {
  let total = 0;
  for (let i = 0; i < rows.length; i++) {
    total = total + rows[i].amount * rows[i].factor_value_snapshot;
  }
  return total;
}

// 비교 대상이 없을 땐 null 반환 (UI에서 "데이터 없음" 표시용)
function changeRate(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const year = parseInt(
    url.searchParams.get('year') ?? String(new Date().getFullYear()),
  );

  const { data: yearRows } = await supabase
    .from('activities')
    .select(
      'date, type, amount, factor_value_snapshot, emission_factors(scope)',
    )
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`);

  const { data: prevYearRows } = await supabase
    .from('activities')
    .select('amount, factor_value_snapshot')
    .gte('date', `${year - 1}-01-01`)
    .lte('date', `${year - 1}-12-31`);

  const rows = yearRows ?? [];
  const totalEmission = sumEmission(rows);
  const prevYearEmission = sumEmission(prevYearRows ?? []);
  const yearlyChangeRate = changeRate(totalEmission, prevYearEmission);

  // 데이터 안에서 가장 최근 월 + 그 직전 월 추출 (시스템 시각 무관)
  const monthSet: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const m = rows[i].date.slice(0, 7);
    if (monthSet.indexOf(m) === -1) monthSet.push(m);
  }
  monthSet.sort();
  const currMonthStr = monthSet[monthSet.length - 1] ?? '';
  const prevMonthStr = monthSet[monthSet.length - 2] ?? '';

  let currMonthEmission = 0;
  let prevMonthEmission = 0;
  for (let i = 0; i < rows.length; i++) {
    const m = rows[i].date.slice(0, 7);
    const e = rows[i].amount * rows[i].factor_value_snapshot;
    if (m === currMonthStr) currMonthEmission += e;
    else if (m === prevMonthStr) prevMonthEmission += e;
  }
  const monthlyChangeRate = changeRate(currMonthEmission, prevMonthEmission);

  const monthlyByType: {
    month: string;
    전기: number;
    원소재: number;
    운송: number;
  }[] = [];
  const scopeMonthly: {
    month: string;
    Scope1: number;
    Scope2: number;
    Scope3: number;
  }[] = [];
  const typeNames: string[] = [];
  const typeValues: number[] = [];

  // 한번에 세 집계 채우기 - 막대,선,도넛 차트
  for (let i = 0; i < rows.length; i++) {
    const a = rows[i];
    const month = a.date.slice(0, 7);
    const emission = a.amount * a.factor_value_snapshot;
    const ef = a.emission_factors as unknown as { scope: string } | null;
    const scope = ef ? ef.scope : '';

    // monthlyByType 누적
    let mIdx = -1;
    for (let j = 0; j < monthlyByType.length; j++) {
      if (monthlyByType[j].month === month) {
        mIdx = j;
        break;
      }
    }
    if (mIdx === -1) {
      monthlyByType.push({ month: month, 전기: 0, 원소재: 0, 운송: 0 });
      mIdx = monthlyByType.length - 1;
    }
    if (a.type === '전기') monthlyByType[mIdx].전기 += emission;
    else if (a.type === '원소재') monthlyByType[mIdx].원소재 += emission;
    else if (a.type === '운송') monthlyByType[mIdx].운송 += emission;

    // scopeMonthly 누적
    let sIdx = -1;
    for (let j = 0; j < scopeMonthly.length; j++) {
      if (scopeMonthly[j].month === month) {
        sIdx = j;
        break;
      }
    }
    if (sIdx === -1) {
      scopeMonthly.push({ month: month, Scope1: 0, Scope2: 0, Scope3: 0 });
      sIdx = scopeMonthly.length - 1;
    }
    if (scope === 'Scope1') scopeMonthly[sIdx].Scope1 += emission;
    else if (scope === 'Scope2') scopeMonthly[sIdx].Scope2 += emission;
    else if (scope === 'Scope3') scopeMonthly[sIdx].Scope3 += emission;

    // typeNames/typeValues 누적 - 도넛 차트
    const tIdx = typeNames.indexOf(a.type);
    if (tIdx === -1) {
      typeNames.push(a.type);
      typeValues.push(emission);
    } else {
      typeValues[tIdx] = typeValues[tIdx] + emission;
    }
  }

  // 월 정렬
  monthlyByType.sort((a, b) => a.month.localeCompare(b.month));
  scopeMonthly.sort((a, b) => a.month.localeCompare(b.month));

  // 도넛 차트 데이터
  const typeRatio: { type: string; value: number; ratio: number }[] = [];
  for (let i = 0; i < typeNames.length; i++) {
    const value = typeValues[i];
    const ratio = totalEmission > 0 ? (value / totalEmission) * 100 : 0;
    typeRatio.push({ type: typeNames[i], value: value, ratio: ratio });
  }

  // 최대 비중 유형 찾기
  let topIdx = 0;
  for (let i = 1; i < typeRatio.length; i++) {
    if (typeRatio[i].ratio > typeRatio[topIdx].ratio) topIdx = i;
  }

  // 인사이트 객체 생성
  const monthsCount = monthlyByType.length === 0 ? 1 : monthlyByType.length;
  const insight =
    typeRatio.length === 0
      ? { type: '', ratio: 0, saving: 0 }
      : {
          type: typeRatio[topIdx].type,
          ratio: typeRatio[topIdx].ratio,
          saving: (typeRatio[topIdx].value / monthsCount) * 0.1,
        };

  return NextResponse.json({
    totalEmission,
    prevMonthEmission,
    prevYearEmission,
    monthlyChangeRate,
    yearlyChangeRate,
    monthlyByType,
    typeRatio,
    scopeMonthly,
    insight,
  });
}
