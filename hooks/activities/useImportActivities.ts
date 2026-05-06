import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importActivities } from '@/lib/api/activities';

export function useImportActivitiesMutation(options?: {
  onSuccess?: (result: { inserted: number; errors: unknown[] }) => void;
  onError?: (err: Error) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importActivities(file),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['calculations'] });
      if (options?.onSuccess) options.onSuccess(result);
    },
    onError: (err: Error) => {
      if (options?.onError) options.onError(err);
    },
  });
}
