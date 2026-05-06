import { useQuery } from '@tanstack/react-query';
import { getActivities } from '@/lib/api/activities';

export function useActivitiesQuery(filters: { month?: string; type?: string }) {
  return useQuery({
    queryKey: ['activities', 'list', filters],
    queryFn: () => getActivities({ month: filters.month, type: filters.type }),
  });
}
