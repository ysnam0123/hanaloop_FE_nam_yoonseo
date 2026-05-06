import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 같은 항목명의 활성 버전을 교체
// 1) 대상 factor 조회 → name 확보
// 2) 같은 name 의 모든 row is_active = false
// 3) 대상 row 만 is_active = true
// 4) 그 항목의 전체 이력 반환 (이력 모달 갱신용)
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const targetRes = await supabase
    .from('emission_factors')
    .select('name')
    .eq('id', id)
    .single();

  if (targetRes.error || !targetRes.data) {
    return NextResponse.json(
      { error: '배출계수를 찾을 수 없습니다.' },
      { status: 404 },
    );
  }

  const name = targetRes.data.name;

  const deactRes = await supabase
    .from('emission_factors')
    .update({ is_active: false })
    .eq('name', name);

  if (deactRes.error) {
    return NextResponse.json(
      { error: deactRes.error.message },
      { status: 500 },
    );
  }

  const actRes = await supabase
    .from('emission_factors')
    .update({ is_active: true })
    .eq('id', id)
    .select('*')
    .single();

  if (actRes.error) {
    return NextResponse.json({ error: actRes.error.message }, { status: 500 });
  }

  const allRes = await supabase
    .from('emission_factors')
    .select('*')
    .eq('name', name)
    .order('valid_from', { ascending: false });

  return NextResponse.json(allRes.data ?? []);
}
