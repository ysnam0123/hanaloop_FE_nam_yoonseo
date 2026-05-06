import { DashboardData } from '@/types/dashboard';

export async function getCalculations(year: number): Promise<DashboardData> {
  const res = await fetch(`/api/calculations?year=${year}`);
  if (!res.ok) throw new Error('대시보드 데이터를 불러오지 못했습니다.');
  return res.json();
}
