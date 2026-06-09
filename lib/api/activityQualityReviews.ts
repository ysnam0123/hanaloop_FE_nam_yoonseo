export async function getConfirmedOutlierIds(): Promise<string[]> {
  const res = await fetch('/api/activity-quality/outliers');
  if (!res.ok) throw new Error('이상치 확인 목록 조회 실패');
  return res.json();
}

export async function confirmOutlier(activityId: string): Promise<void> {
  const res = await fetch('/api/activity-quality/outliers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activityId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? '이상치 정상 확인 실패');
  }
}
