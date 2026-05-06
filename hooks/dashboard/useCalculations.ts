// 대시보드 집계(/api/calculations) 데이터를 가져오는 훅.
import { useQuery } from '@tanstack/react-query';
import { getCalculations } from '@/lib/api/calculations';

export function useCalculationsQuery(year: number) {
  return useQuery({
    queryKey: ['calculations', year],
    queryFn: () => getCalculations(year),
  });
}
