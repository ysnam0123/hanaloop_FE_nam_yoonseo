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
  const rawActivityType = String(body.activity_type ?? '').trim();
  const activity_type =
    rawActivityType || inferActivityType(String(name), String(unit));
  const version = body.version;
  const valid_from = body.valid_from;

  const { data, error } = await supabase
    .from('emission_factors')
    .update({
      name: name,
      activity_type: activity_type,
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
