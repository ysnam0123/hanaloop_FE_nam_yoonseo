import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveActivity } from '@/lib/api/activities';
import { Activity } from '@/types/activities';

export function useSaveActivityMutation(options?: {
  onSuccess?: (data: Activity, isEdit: boolean) => void;
  onError?: (err: Error) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { body: Record<string, unknown>; id?: string }) =>
      saveActivity(vars.body, vars.id),
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['calculations'] });
      if (options?.onSuccess) options.onSuccess(data, !!vars.id);
    },
    onError: (err: Error) => {
      if (options?.onError) options.onError(err);
    },
  });
}
