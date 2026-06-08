'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/layout/Toast';
import { useCalculationsQuery } from '@/hooks/dashboard/useCalculations';
import { useGoalQuery, useSaveGoalMutation } from '@/hooks/goals/useGoal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUS_OPTIONS = ['전체', '전기', '원소재', '운송'];

export default function GoalSettingsModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [baselineYear, setBaselineYear] = useState(2024);
  const [targetYear, setTargetYear] = useState(2025);
  const [reductionRate, setReductionRate] = useState('15');
  const [focusType, setFocusType] = useState('전체');

  const { data: baselineData } = useCalculationsQuery(baselineYear);
  const { data: existingGoal } = useGoalQuery(targetYear);
  const baselineEmission = baselineData?.totalEmission ?? 0;
  const targetEmission = useMemo(() => {
    const rate = Number(reductionRate) || 0;
    return Math.max(0, baselineEmission * (1 - rate / 100));
  }, [baselineEmission, reductionRate]);

  useEffect(() => {
    if (!isOpen || !existingGoal) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBaselineYear(existingGoal.baseline_year);
    setReductionRate(String(existingGoal.reduction_rate));
    setFocusType(existingGoal.focus_type ?? '전체');
  }, [existingGoal, isOpen]);

  const saveMutation = useSaveGoalMutation({
    onSuccess: () => {
      showToast('success', '목표가 저장되었습니다.');
      onClose();
    },
    onError: (err) => showToast('error', err.message),
  });

  function handleSave() {
    if (user?.role !== 'executive') {
      showToast('error', '목표 설정은 경영진만 사용할 수 있습니다.');
      return;
    }

    saveMutation.mutate({
      baseline_year: baselineYear,
      target_year: targetYear,
      reduction_rate: Number(reductionRate),
      baseline_emission: baselineEmission,
      target_emission: targetEmission,
      focus_type: focusType,
      created_by: user.id,
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-green-100 px-6 py-5">
          <div>
            <p className="text-xs font-black text-[#007A33]">목표 관리</p>
            <h2 className="mt-1 text-lg font-black text-gray-950">
              목표 설정
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              기준연도 배출량을 바탕으로 목표연도 감축 기준을 설정합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold text-gray-600">기준연도</span>
              <select
                value={baselineYear}
                onChange={(event) => setBaselineYear(Number(event.target.value))}
                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-600">목표연도</span>
              <select
                value={targetYear}
                onChange={(event) => setTargetYear(Number(event.target.value))}
                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {[2025, 2026, 2030].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold text-gray-600">
              감축 목표율
            </span>
            <div className="mt-1.5 flex items-center rounded-xl border border-gray-200 pr-3 focus-within:ring-2 focus-within:ring-green-500">
              <input
                type="number"
                value={reductionRate}
                onChange={(event) => setReductionRate(event.target.value)}
                className="h-10 min-w-0 flex-1 rounded-xl px-3 text-sm focus:outline-none"
              />
              <span className="text-sm font-bold text-gray-500">%</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-gray-600">
              집중 관리 유형
            </span>
            <select
              value={focusType}
              onChange={(event) => setFocusType(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {FOCUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-xs font-bold text-green-700">기준 배출량</p>
              <p className="mt-2 text-2xl font-black text-gray-950">
                {(baselineEmission / 1000).toFixed(1)}
                <span className="ml-1 text-sm text-gray-500">tCO₂e</span>
              </p>
            </div>
            <div className="rounded-xl bg-[#0B1A2A] p-4 text-white">
              <p className="text-xs font-bold text-[#6EF28C]">목표 배출량</p>
              <p className="mt-2 text-2xl font-black">
                {(targetEmission / 1000).toFixed(1)}
                <span className="ml-1 text-sm text-slate-300">tCO₂e</span>
              </p>
            </div>
          </section>
        </div>

        <div className="flex gap-2 border-t border-green-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 flex-1 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-10 flex-1 rounded-xl bg-[#007A33] text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {saveMutation.isPending ? '저장 중...' : '목표 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
