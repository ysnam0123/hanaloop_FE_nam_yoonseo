import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveFactor } from '@/lib/api/factors';
import type { Factor } from '@/types/factor';

export function useSaveFactorMutation(options?: {
  onSuccess?: (data: Factor, isEdit: boolean) => void;
  onError?: (err: Error) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { body: Record<string, unknown>; id?: string }) =>
      saveFactor(vars.body, vars.id),
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ['factors'] });
      if (options?.onSuccess) options.onSuccess(data, !!vars.id);
    },
    onError: (err: Error) => {
      if (options?.onError) options.onError(err);
    },
  });
}
