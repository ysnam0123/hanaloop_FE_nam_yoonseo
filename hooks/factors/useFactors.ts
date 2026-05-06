import { useQuery } from '@tanstack/react-query';
import { getAllFactors, getFactors } from '@/lib/api/factors';

export function useFactorsQuery() {
  return useQuery({
    queryKey: ['factors', 'list'],
    queryFn: getFactors,
  });
}

export function useAllFactorsQuery() {
  return useQuery({
    queryKey: ['factors', 'list', 'all'],
    queryFn: getAllFactors,
  });
}
