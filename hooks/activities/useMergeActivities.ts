import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mergeActivities } from '@/lib/api/activities';

export function useMergeActivitiesMutation(options?: {
  onSuccess?: (vars: { ids: string[]; action: 'merge' | 'delete' }) => void;
  onError?: (vars: { ids: string[]; action: 'merge' | 'delete' }) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { ids: string[]; action: 'merge' | 'delete' }) =>
      mergeActivities(vars.ids, vars.action),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['calculations'] });
      if (options?.onSuccess) options.onSuccess(vars);
    },
    onError: (_err, vars) => {
      if (options?.onError) options.onError(vars);
    },
  });
}
