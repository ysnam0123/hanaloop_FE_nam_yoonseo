'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'carbonloop.confirmedOutlierIds';
const OUTLIER_CHANGE_EVENT = 'carbonloop-confirmed-outliers-change';
const EMPTY_CONFIRMED_OUTLIERS: string[] = [];
let cachedOutliersRaw: string | null = null;
let cachedOutliers: string[] = EMPTY_CONFIRMED_OUTLIERS;

function readConfirmedOutliers(): string[] {
  if (typeof window === 'undefined') return EMPTY_CONFIRMED_OUTLIERS;

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) {
      cachedOutliersRaw = null;
      cachedOutliers = EMPTY_CONFIRMED_OUTLIERS;
      return cachedOutliers;
    }

    if (value === cachedOutliersRaw) {
      return cachedOutliers;
    }

    const parsed = JSON.parse(value);
    cachedOutliersRaw = value;
    cachedOutliers = Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === 'string')
      : EMPTY_CONFIRMED_OUTLIERS;
    return cachedOutliers;
  } catch {
    cachedOutliersRaw = null;
    cachedOutliers = EMPTY_CONFIRMED_OUTLIERS;
    return cachedOutliers;
  }
}

function writeConfirmedOutliers(ids: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(OUTLIER_CHANGE_EVENT));
}

function subscribeToConfirmedOutliers(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(OUTLIER_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(OUTLIER_CHANGE_EVENT, onStoreChange);
  };
}

export function useConfirmedOutliers() {
  const confirmedOutlierIds = useSyncExternalStore(
    subscribeToConfirmedOutliers,
    readConfirmedOutliers,
    () => EMPTY_CONFIRMED_OUTLIERS,
  );

  const confirmOutlier = useCallback((activityId: string) => {
    const current = readConfirmedOutliers();
    if (current.includes(activityId)) return;
    writeConfirmedOutliers([...current, activityId]);
  }, []);

  return { confirmedOutlierIds, confirmOutlier };
}
