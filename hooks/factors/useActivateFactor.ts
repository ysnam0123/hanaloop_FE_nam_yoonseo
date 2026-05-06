import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activateFactor } from '@/lib/api/factors';
import type { Factor } from '@/types/factor';

export function useActivateFactorMutation(options?: {
  onSuccess?: (factor: Factor) => void;
  onError?: (err: Error) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (factor: Factor) => activateFactor(factor.id),
    onSuccess: (_data, factor) => {
      qc.invalidateQueries({ queryKey: ['factors'] });
      if (options?.onSuccess) options.onSuccess(factor);
    },
    onError: (err: Error) => {
      if (options?.onError) options.onError(err);
    },
  });
}
