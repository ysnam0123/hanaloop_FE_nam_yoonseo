import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const name = body.name;
  const scope = body.scope;
  const factor_value = body.factor_value;
  const unit = body.unit;
  const version = body.version;
  const valid_from = body.valid_from;

  const { data, error } = await supabase
    .from('emission_factors')
    .update({
      name: name,
      scope: scope,
      factor_value: factor_value,
      unit: unit,
      version: version,
      valid_from: valid_from,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { error } = await supabase
    .from('emission_factors')
    .delete()
    .eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
