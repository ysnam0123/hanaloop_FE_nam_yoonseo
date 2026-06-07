import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const loginId = String(body.login_id ?? '').trim();
  const password = String(body.password ?? '').trim();

  if (!loginId || !password) {
    return NextResponse.json(
      { message: '아이디와 비밀번호를 입력해주세요.' },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from('app_users')
    .select('id, name, role, login_id')
    .eq('login_id', loginId)
    .eq('password', password)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: '아이디 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 },
    );
  }

  return NextResponse.json(data);
}
