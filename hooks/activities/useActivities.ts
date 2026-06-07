import { useQuery } from '@tanstack/react-query';
import { getActivities } from '@/lib/api/activities';

export function useActivitiesQuery(filters: {
  year?: number;
  month?: string;
  site?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: ['activities', 'list', filters],
    queryFn: () =>
      getActivities({
        year: filters.year,
        month: filters.month,
        site: filters.site,
        type: filters.type,
      }),
  });
}
