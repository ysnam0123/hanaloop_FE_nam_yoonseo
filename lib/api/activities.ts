import { Activity } from '@/types/activities';

export async function getActivities(filters: {
  year?: number;
  month?: string;
  type?: string;
}): Promise<Activity[]> {
  const params = new URLSearchParams();
  if (filters.year) params.set('year', String(filters.year));
  if (filters.month) params.set('month', filters.month);
  if (filters.type) params.set('type', filters.type);
  const res = await fetch(`/api/activities?${params}`);
  if (!res.ok) throw new Error('활동 조회 실패');
  return res.json();
}

export async function saveActivity(
  body: Record<string, unknown>,
  id?: string,
): Promise<Activity> {
  const url = id ? `/api/activities/${id}` : '/api/activities';
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? '저장 실패');
  }
  return res.json();
}

export async function deleteActivity(id: string): Promise<void> {
  const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('삭제 실패');
}

export async function importActivities(file: File): Promise<{
  inserted: number;
  errors: unknown[];
}> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/activities/import', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('임포트 실패');
  return res.json();
}

export async function mergeActivities(
  ids: string[],
  action: 'merge' | 'delete',
): Promise<void> {
  const res = await fetch('/api/activities/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: ids, action: action }),
  });
  if (!res.ok) throw new Error(action === 'delete' ? '삭제 실패' : '합산 실패');
}
