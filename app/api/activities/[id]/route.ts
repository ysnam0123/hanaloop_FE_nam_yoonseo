import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 활동 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const body = await request.json();
  const date = body.date;
  const site = body.site ?? '본사';
  const type = body.type;
  const description = body.description;
  const amount = body.amount;
  const unit = body.unit;
  const factor_id = body.factor_id;

  const existingRes = await supabase
    .from('activities')
    .select('factor_id, factor_value_snapshot')
    .eq('id', id)
    .single();

  let factor_value_snapshot = undefined;
  let oldFactorId = null;
  if (existingRes.data) {
    factor_value_snapshot = existingRes.data.factor_value_snapshot;
    oldFactorId = existingRes.data.factor_id;
  }

  if (factor_id && factor_id !== oldFactorId) {
    const factorRes = await supabase
      .from('emission_factors')
      .select('factor_value')
      .eq('id', factor_id)
      .single();
    if (factorRes.data) {
      factor_value_snapshot = factorRes.data.factor_value;
    }
  }

  const { data, error } = await supabase
    .from('activities')
    .update({
      date: date,
      site: site,
      type: type,
      description: description,
      amount: amount,
      unit: unit,
      factor_id: factor_id,
      factor_value_snapshot: factor_value_snapshot,
    })
    .eq('id', id)
    .select('*, emission_factors(name, activity_type, scope, unit)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// 활동 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
