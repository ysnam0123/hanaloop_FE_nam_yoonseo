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
      'date, site, type, amount, factor_value_snapshot, emission_factors(scope)',
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

  const monthlyByType: ({ month: string } & Record<string, string | number>)[] =
    [];
  const scopeMonthly: {
    month: string;
    Scope1: number;
    Scope2: number;
    Scope3: number;
  }[] = [];
  const typeNames: string[] = [];
  const typeValues: number[] = [];
  const siteNames: string[] = [];
  const siteValues: number[] = [];
  const comboKeys: string[] = [];
  const comboSites: string[] = [];
  const comboTypes: string[] = [];
  const comboValues: number[] = [];

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
      monthlyByType.push({ month: month });
      mIdx = monthlyByType.length - 1;
    }
    const existingTypeValue = Number(monthlyByType[mIdx][a.type] ?? 0);
    monthlyByType[mIdx][a.type] = existingTypeValue + emission;

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

    // siteNames/siteValues 누적 - 사업장별 배출량
    const site = a.site ?? '본사';
    const siteIdx = siteNames.indexOf(site);
    if (siteIdx === -1) {
      siteNames.push(site);
      siteValues.push(emission);
    } else {
      siteValues[siteIdx] = siteValues[siteIdx] + emission;
    }

    // site + type 조합 누적 - 실제 감축 액션 단위
    const comboKey = `${site}__${a.type}`;
    const comboIdx = comboKeys.indexOf(comboKey);
    if (comboIdx === -1) {
      comboKeys.push(comboKey);
      comboSites.push(site);
      comboTypes.push(a.type);
      comboValues.push(emission);
    } else {
      comboValues[comboIdx] = comboValues[comboIdx] + emission;
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

  const siteRatio: { site: string; value: number; ratio: number }[] = [];
  for (let i = 0; i < siteNames.length; i++) {
    const value = siteValues[i];
    const ratio = totalEmission > 0 ? (value / totalEmission) * 100 : 0;
    siteRatio.push({ site: siteNames[i], value: value, ratio: ratio });
  }
  siteRatio.sort((a, b) => b.value - a.value);

  // 최대 비중 사업장+유형 조합 찾기
  let topComboIdx = 0;
  for (let i = 1; i < comboValues.length; i++) {
    if (comboValues[i] > comboValues[topComboIdx]) topComboIdx = i;
  }

  // 인사이트 객체 생성
  const monthsCount = monthlyByType.length === 0 ? 1 : monthlyByType.length;
  const insight =
    comboValues.length === 0
      ? { type: '', site: '', label: '', ratio: 0, saving: 0 }
      : {
          type: comboTypes[topComboIdx],
          site: comboSites[topComboIdx],
          label: `${comboSites[topComboIdx]} ${comboTypes[topComboIdx]}`,
          ratio:
            totalEmission > 0
              ? (comboValues[topComboIdx] / totalEmission) * 100
              : 0,
          saving: (comboValues[topComboIdx] / monthsCount) * 0.1,
        };

  return NextResponse.json({
    totalEmission,
    prevMonthEmission,
    prevYearEmission,
    monthlyChangeRate,
    yearlyChangeRate,
    monthlyByType,
    typeRatio,
    siteRatio,
    scopeMonthly,
    insight,
  });
}
