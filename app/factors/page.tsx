'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import FactorCards from '@/components/factors/FactorCards';
import FactorOverview from '@/components/factors/FactorOverview';
import FactorTable from '@/components/factors/factorTable/FactorTable';
import FactorModal from '@/components/factors/factorModal/FactorModal';
import HistoryModal from '@/components/factors/HistoryModal';
import { useToast } from '@/components/layout/Toast';
import { Factor } from '@/types/factor';
import { useAllFactorsQuery } from '@/hooks/factors/useFactors';
import { useSaveFactorMutation } from '@/hooks/factors/useSaveFactor';
import { useActivateFactorMutation } from '@/hooks/factors/useActivateFactor';
import { useDeactivateFactorMutation } from '@/hooks/factors/useDeActivateFactor';
import { getFactorInsights } from '@/lib/factorInsights';

export default function FactorsPage() {
  const { showToast } = useToast();
  const [year, setYear] = useState(2025);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Factor | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Factor | null>(null);

  // 배출계수 조회
  const { data: allFactors = [] } = useAllFactorsQuery();
  const factorInsights = useMemo(
    () => getFactorInsights(allFactors),
    [allFactors],
  );

  // 등록/수정
  const saveMutation = useSaveFactorMutation({
    onSuccess: (_data, isEdit) => {
      showToast('success', isEdit ? '수정되었습니다.' : '저장되었습니다.');
      setCreateOpen(false);
      setEditTarget(null);
    },
    onError: () => showToast('error', '오류가 발생했습니다.'),
  });

  function handleSave(body: Record<string, unknown>) {
    saveMutation.mutate({ body: body, id: editTarget?.id });
  }
  // 활성화.
  const activateMutation = useActivateFactorMutation({
    onSuccess: (factor) => {
      showToast(
        'success',
        `v${factor.version}이 현재 배출계수로 적용되었습니다.`,
      );
      setHistoryTarget(null);
    },
    onError: () => showToast('error', '적용 실패'),
  });

  function handleActivate(factor: Factor) {
    activateMutation.mutate(factor);
  }

  // 비활성화. 서버에 PUT 후 캐시 무효화는 훅이 알아서 처리.
  const deactivateMutation = useDeactivateFactorMutation({
    onSuccess: (factor) => {
      showToast('success', `${factor.name} 배출계수의 적용이 취소되었습니다.`);
    },
    onError: () => showToast('error', '비활성화 실패'),
  });

  function handleDeactivate(factor: Factor) {
    deactivateMutation.mutate(factor);
  }
  const activeFactors = allFactors.filter((f) => f.is_active);
  const historyItems = historyTarget
    ? allFactors.filter((f) => f.name === historyTarget.name)
    : [];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        title="배출계수"
        subtitle="계수 라이브러리와 적용 이력"
        year={year}
        onYearChange={setYear}
      />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              배출계수 라이브러리
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              활동 데이터에 적용되는 배출계수를 관리합니다.
            </p>
            <p className="text-sm text-gray-400">
              활동 입력에 사용할 배출계수와 버전 이력을 관리합니다.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 px-4 py-2 bg-[#16A34A] text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            새 배출계수 추가
          </button>
        </div>

        <FactorOverview insights={factorInsights} />

        <FactorCards
          factors={activeFactors}
          onEdit={setEditTarget}
          onDeactivate={handleDeactivate}
        />
        <FactorTable factors={allFactors} onRowClick={setHistoryTarget} />
      </main>

      {/* 배출계수 추가 모달  */}
      <FactorModal
        isOpen={createOpen || !!editTarget}
        mode={editTarget ? 'edit' : 'create'}
        data={editTarget ?? undefined}
        factors={allFactors}
        onClose={() => {
          setCreateOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSave}
      />
      {/* 이력 모달창 */}
      {historyTarget && (
        <HistoryModal
          isOpen={!!historyTarget}
          factor={historyTarget}
          historyItems={historyItems}
          onClose={() => setHistoryTarget(null)}
          onActivate={handleActivate}
        />
      )}
    </div>
  );
}
