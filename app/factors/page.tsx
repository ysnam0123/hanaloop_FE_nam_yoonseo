'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import FactorCards from '@/components/factors/FactorCards';
import FactorTable from '@/components/factors/FactorTable';
import FactorModal from '@/components/factors/FactorModal';
import HistoryModal from '@/components/factors/HistoryModal';
import { useToast } from '@/components/layout/Toast';

export interface Factor {
  id: string;
  name: string;
  scope: string;
  factor_value: number;
  unit: string;
  version: string;
  valid_from: string;
  is_active: boolean;
}

const MOCK_FACTORS: Factor[] = [
  {
    id: 'f-elec-3',
    name: '한전 전력',
    scope: 'Scope 2',
    factor_value: 0.4781,
    unit: 'kWh',
    version: 'v2025.1',
    valid_from: '2025-01-01',
    is_active: true,
  },
  {
    id: 'f-elec-2',
    name: '한전 전력',
    scope: 'Scope 2',
    factor_value: 0.4594,
    unit: 'kWh',
    version: 'v2024.1',
    valid_from: '2024-01-01',
    is_active: false,
  },
  {
    id: 'f-elec-1',
    name: '한전 전력',
    scope: 'Scope 2',
    factor_value: 0.4567,
    unit: 'kWh',
    version: 'v2023.1',
    valid_from: '2023-01-01',
    is_active: false,
  },
  {
    id: 'f-alu-2',
    name: '알루미늄 원자재',
    scope: 'Scope 3',
    factor_value: 8.14,
    unit: 'kg',
    version: 'v2025.1',
    valid_from: '2025-01-01',
    is_active: true,
  },
  {
    id: 'f-alu-1',
    name: '알루미늄 원자재',
    scope: 'Scope 3',
    factor_value: 8.02,
    unit: 'kg',
    version: 'v2024.1',
    valid_from: '2024-01-01',
    is_active: false,
  },
  {
    id: 'f-trans-2',
    name: '화물 운송',
    scope: 'Scope 3',
    factor_value: 0.092,
    unit: 'ton-km',
    version: 'v2025.1',
    valid_from: '2025-01-01',
    is_active: true,
  },
  {
    id: 'f-trans-1',
    name: '화물 운송',
    scope: 'Scope 3',
    factor_value: 0.098,
    unit: 'ton-km',
    version: 'v2024.1',
    valid_from: '2024-01-01',
    is_active: false,
  },
  {
    id: 'f-gas-1',
    name: '도시가스',
    scope: 'Scope 1',
    factor_value: 2.176,
    unit: 'm³',
    version: 'v2025.1',
    valid_from: '2025-01-01',
    is_active: true,
  },
];

export default function FactorsPage() {
  const { showToast } = useToast();
  const [year, setYear] = useState(2024);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Factor | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Factor | null>(null);
  const [allFactors, setAllFactors] = useState<Factor[]>(MOCK_FACTORS);

  function handleSave(body: Record<string, unknown>) {
    void body;
    showToast('success', editTarget ? '수정되었습니다.' : '저장되었습니다.');
    setCreateOpen(false);
    setEditTarget(null);
  }

  function handleActivate(factor: Factor) {
    setAllFactors((prev) =>
      prev.map((f) => {
        if (f.id === factor.id) return { ...f, is_active: true };
        if (f.name === factor.name && f.is_active)
          return { ...f, is_active: false };
        return f;
      }),
    );
    showToast(
      'success',
      `${factor.version}이 현재 배출계수로 적용되었습니다.`,
    );
    setHistoryTarget(null);
  }

  function handleDeactivate(factor: Factor) {
    setAllFactors((prev) =>
      prev.map((f) => (f.id === factor.id ? { ...f, is_active: false } : f)),
    );
    showToast('success', `${factor.name} 배출계수의 적용이 취소되었습니다.`);
  }

  const activeFactors = allFactors.filter((f) => f.is_active);
  const historyItems = historyTarget
    ? allFactors.filter((f) => f.name === historyTarget.name)
    : [];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        title="데이터 관리"
        subtitle="배출계수 관리"
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
              배출계수 변경 시 해당 시작일 이후 데이터의 배출량이 자동
              재계산됩니다.
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

        <FactorCards
          factors={activeFactors}
          onEdit={setEditTarget}
          onDeactivate={handleDeactivate}
        />
        <FactorTable factors={allFactors} onRowClick={setHistoryTarget} />
      </main>

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
