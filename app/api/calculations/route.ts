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

function changeRate(curr: number, prev: number) {
  if (prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
}

function ym(year: number, monthIndex: number) {
  const d = new Date(year, monthIndex, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const year = parseInt(
    url.searchParams.get('year') ?? String(new Date().getFullYear()),
  );

  const now = new Date();
  const currMonth = ym(year, now.getMonth());
  const prevMonth = ym(year, now.getMonth() - 1);

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

  const { data: currMonthRows } = await supabase
    .from('activities')
    .select('amount, factor_value_snapshot')
    .gte('date', `${currMonth}-01`)
    .lte('date', `${currMonth}-31`);

  const { data: prevMonthRows } = await supabase
    .from('activities')
    .select('amount, factor_value_snapshot')
    .gte('date', `${prevMonth}-01`)
    .lte('date', `${prevMonth}-31`);

  const rows = yearRows ?? [];

  const totalEmission = sumEmission(rows);
  const prevYearEmission = sumEmission(prevYearRows ?? []);
  const currMonthEmission = sumEmission(currMonthRows ?? []);
  const prevMonthEmission = sumEmission(prevMonthRows ?? []);
  const monthlyChangeRate = changeRate(currMonthEmission, prevMonthEmission);
  const yearlyChangeRate = changeRate(totalEmission, prevYearEmission);

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

  for (let i = 0; i < rows.length; i++) {
    const a = rows[i];
    const month = a.date.slice(0, 7);
    const emission = a.amount * a.factor_value_snapshot;

    const ef = a.emission_factors as unknown as { scope: string } | null;
    const scope = ef ? ef.scope : '';

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

    const tIdx = typeNames.indexOf(a.type);
    if (tIdx === -1) {
      typeNames.push(a.type);
      typeValues.push(emission);
    } else {
      typeValues[tIdx] = typeValues[tIdx] + emission;
    }
  }

  monthlyByType.sort((a, b) => a.month.localeCompare(b.month));
  scopeMonthly.sort((a, b) => a.month.localeCompare(b.month));

  const typeRatio: { type: string; value: number; ratio: number }[] = [];
  for (let i = 0; i < typeNames.length; i++) {
    const value = typeValues[i];
    const ratio = totalEmission > 0 ? (value / totalEmission) * 100 : 0;
    typeRatio.push({ type: typeNames[i], value: value, ratio: ratio });
  }

  let topIdx = 0;
  for (let i = 1; i < typeRatio.length; i++) {
    if (typeRatio[i].ratio > typeRatio[topIdx].ratio) topIdx = i;
  }
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
