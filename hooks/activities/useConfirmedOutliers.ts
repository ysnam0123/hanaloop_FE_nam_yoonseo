'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmOutlier as confirmOutlierRequest,
  getConfirmedOutlierIds,
} from '@/lib/api/activityQualityReviews';

const CONFIRMED_OUTLIERS_QUERY_KEY = ['activity-quality', 'confirmed-outliers'];

export function useConfirmedOutliers() {
  const qc = useQueryClient();
  const { data: confirmedOutlierIds = [], isLoading } = useQuery({
    queryKey: CONFIRMED_OUTLIERS_QUERY_KEY,
    queryFn: getConfirmedOutlierIds,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: confirmOutlierRequest,
    onMutate: async (activityId) => {
      await qc.cancelQueries({ queryKey: CONFIRMED_OUTLIERS_QUERY_KEY });
      const previous =
        qc.getQueryData<string[]>(CONFIRMED_OUTLIERS_QUERY_KEY) ?? [];

      if (!previous.includes(activityId)) {
        qc.setQueryData<string[]>(CONFIRMED_OUTLIERS_QUERY_KEY, [
          ...previous,
          activityId,
        ]);
      }

      return { previous };
    },
    onError: (_err, _activityId, context) => {
      qc.setQueryData(CONFIRMED_OUTLIERS_QUERY_KEY, context?.previous ?? []);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CONFIRMED_OUTLIERS_QUERY_KEY });
    },
  });

  const confirmOutlier = useCallback(
    (activityId: string) => {
      if (confirmedOutlierIds.includes(activityId)) return;
      mutate(activityId);
    },
    [confirmedOutlierIds, mutate],
  );

  return {
    confirmedOutlierIds,
    confirmOutlier,
    isLoading,
    isConfirming: isPending,
  };
}
