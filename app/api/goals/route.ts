import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const targetYear = url.searchParams.get('targetYear');

  let query = supabase
    .from('carbon_goals')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (targetYear) {
    query = query.eq('target_year', Number(targetYear));
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data?.[0] ?? null);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const baselineEmission = Number(body.baseline_emission ?? 0);
  const reductionRate = Number(body.reduction_rate ?? 0);
  const targetEmission =
    body.target_emission === undefined
      ? baselineEmission * (1 - reductionRate / 100)
      : Number(body.target_emission);

  const payload = {
    baseline_year: Number(body.baseline_year),
    target_year: Number(body.target_year),
    reduction_rate: reductionRate,
    baseline_emission: baselineEmission,
    target_emission: targetEmission,
    focus_type: body.focus_type === '전체' ? null : (body.focus_type ?? null),
    created_by: body.created_by ?? null,
    updated_at: new Date().toISOString(),
  };

  if (!payload.baseline_year || !payload.target_year) {
    return NextResponse.json(
      { message: '기준연도와 목표연도는 필수입니다.' },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from('carbon_goals')
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
