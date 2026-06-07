import { CarbonGoal } from '@/types/goals';

export async function getGoal(targetYear: number): Promise<CarbonGoal | null> {
  const res = await fetch(`/api/goals?targetYear=${targetYear}`);
  if (!res.ok) throw new Error('목표 조회 실패');
  return res.json();
}

export async function saveGoal(
  body: Record<string, unknown>,
): Promise<CarbonGoal> {
  const res = await fetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? '목표 저장 실패');
  }
  return res.json();
}
