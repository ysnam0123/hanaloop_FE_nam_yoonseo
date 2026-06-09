import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('activity_quality_reviews')
    .select('activity_id')
    .eq('issue_type', 'outlier')
    .eq('status', 'confirmed');

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map((row) => row.activity_id));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const activityId = body.activityId;

  if (typeof activityId !== 'string' || activityId.length === 0) {
    return NextResponse.json(
      { message: 'activityId는 필수입니다.' },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from('activity_quality_reviews')
    .upsert(
      {
        activity_id: activityId,
        issue_type: 'outlier',
        status: 'confirmed',
        reviewed_at: new Date().toISOString(),
      },
      { onConflict: 'activity_id,issue_type' },
    );

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
