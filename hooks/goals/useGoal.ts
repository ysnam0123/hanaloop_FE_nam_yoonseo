import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getGoal, saveGoal } from '@/lib/api/goals';

export function useGoalQuery(targetYear: number) {
  return useQuery({
    queryKey: ['goals', targetYear],
    queryFn: () => getGoal(targetYear),
  });
}

export function useSaveGoalMutation(options?: {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveGoal,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      if (typeof vars.target_year === 'number') {
        qc.invalidateQueries({ queryKey: ['goals', vars.target_year] });
      }
      if (options?.onSuccess) options.onSuccess();
    },
    onError: (err: Error) => {
      if (options?.onError) options.onError(err);
    },
  });
}
