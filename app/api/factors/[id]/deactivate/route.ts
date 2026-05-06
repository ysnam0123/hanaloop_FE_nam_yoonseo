import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 단일 factor 비활성화
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('emission_factors')
    .update({ is_active: false })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
