import type { Factor } from '@/types/factor';

export async function getFactors(): Promise<Factor[]> {
  const res = await fetch('/api/factors');
  if (!res.ok) throw new Error('배출계수 조회 실패');
  return res.json();
}

export async function getAllFactors(): Promise<Factor[]> {
  const res = await fetch('/api/factors?all=true');
  if (!res.ok) throw new Error('배출계수 조회 실패');
  const grouped: Record<string, Factor[]> = await res.json();
  const result: Factor[] = [];
  const groups = Object.values(grouped);
  for (let i = 0; i < groups.length; i++) {
    const list = groups[i];
    for (let j = 0; j < list.length; j++) {
      result.push(list[j]);
    }
  }
  return result;
}

export async function saveFactor(
  body: Record<string, unknown>,
  id?: string,
): Promise<Factor> {
  const url = id ? `/api/factors/${id}` : '/api/factors';
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('저장 실패');
  return res.json();
}

export async function activateFactor(id: string): Promise<Factor[]> {
  const res = await fetch(`/api/factors/${id}/activate`, { method: 'PUT' });
  if (!res.ok) throw new Error('적용 실패');
  return res.json();
}

export async function deactivateFactor(id: string): Promise<Factor> {
  const res = await fetch(`/api/factors/${id}/deactivate`, { method: 'PUT' });
  if (!res.ok) throw new Error('비활성화 실패');
  return res.json();
}
