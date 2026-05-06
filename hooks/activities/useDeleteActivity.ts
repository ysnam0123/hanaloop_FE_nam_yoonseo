import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteActivity } from '@/lib/api/activities';

export function useDeleteActivityMutation(options?: {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteActivity(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['calculations'] });
      if (options?.onSuccess) options.onSuccess();
    },
    onError: (err: Error) => {
      if (options?.onError) options.onError(err);
    },
  });
}
