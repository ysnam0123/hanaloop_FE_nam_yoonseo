import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ids: string[] = body.ids;
  const action: string = body.action;

  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: 'ids 필요' }, { status: 400 });
  }

  if (action === 'delete') {
    const { error } = await supabase.from('activities').delete().in('id', ids);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === 'merge') {
    const selectRes = await supabase
      .from('activities')
      .select('id, amount, factor_value_snapshot')
      .in('id', ids);

    if (selectRes.error || !selectRes.data) {
      return NextResponse.json(
        { error: selectRes.error ? selectRes.error.message : '조회 실패' },
        { status: 500 },
      );
    }

    let totalAmount = 0;
    for (let i = 0; i < selectRes.data.length; i++) {
      totalAmount = totalAmount + selectRes.data[i].amount;
    }

    await supabase
      .from('activities')
      .update({ amount: totalAmount })
      .eq('id', ids[0]);

    if (ids.length > 1) {
      const restIds: string[] = [];
      for (let i = 1; i < ids.length; i++) {
        restIds.push(ids[i]);
      }
      await supabase.from('activities').delete().in('id', restIds);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: '잘못된 action' }, { status: 400 });
}
