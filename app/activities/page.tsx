'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import ActivityTable from '@/components/activities/ActivityTable';
import ActivityModal from '@/components/activities/ActivityModal';
import DeleteModal from '@/components/activities/DeleteModal';
import DuplicateModal from '@/components/activities/DuplicateModal';
import BottomStats from '@/components/activities/BottomStats';
import PeriodChart from '@/components/activities/PeriodChart';
import { useToast } from '@/components/layout/Toast';

export interface Activity {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  unit: string;
  factor_id: string;
  factor_value_snapshot: number;
  emission: number;
  is_duplicate: boolean;
  emission_factors: { name: string; scope: string; unit: string };
}

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

interface DuplicateGroup {
  type: string;
  month: string;
  items: Activity[];
}

const MOCK_FACTORS: Factor[] = [
  {
    id: 'f-1',
    name: '한전 전력',
    scope: 'Scope2',
    factor_value: 0.4781,
    unit: 'kWh',
    version: 'v2025.1',
    valid_from: '2025-01-01',
    is_active: true,
  },
  {
    id: 'f-2',
    name: '알루미늄 원자재',
    scope: 'Scope3',
    factor_value: 8.14,
    unit: 'kg',
    version: 'v2025.1',
    valid_from: '2025-01-01',
    is_active: true,
  },
  {
    id: 'f-3',
    name: '화물 운송',
    scope: 'Scope3',
    factor_value: 0.092,
    unit: 'ton-km',
    version: 'v2025.1',
    valid_from: '2025-01-01',
    is_active: true,
  },
];

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a-1',
    date: '2025-03-12',
    type: '전기',
    description: '3월 사무실 전력 사용량',
    amount: 12500,
    unit: 'kWh',
    factor_id: 'f-1',
    factor_value_snapshot: 0.4781,
    emission: 5976.25,
    is_duplicate: false,
    emission_factors: { name: '한전 전력', scope: 'Scope2', unit: 'kWh' },
  },
  {
    id: 'a-2',
    date: '2025-03-20',
    type: '전기',
    description: '3월 공장 전력 추가 측정',
    amount: 4200,
    unit: 'kWh',
    factor_id: 'f-1',
    factor_value_snapshot: 0.4781,
    emission: 2008.02,
    is_duplicate: true,
    emission_factors: { name: '한전 전력', scope: 'Scope2', unit: 'kWh' },
  },
  {
    id: 'a-3',
    date: '2025-04-05',
    type: '원소재',
    description: '알루미늄 잉곳 구매',
    amount: 850,
    unit: 'kg',
    factor_id: 'f-2',
    factor_value_snapshot: 8.14,
    emission: 6919.0,
    is_duplicate: false,
    emission_factors: { name: '알루미늄 원자재', scope: 'Scope3', unit: 'kg' },
  },
  {
    id: 'a-4',
    date: '2025-04-18',
    type: '운송',
    description: '제품 물류 배송 (서울→부산)',
    amount: 320,
    unit: 'ton-km',
    factor_id: 'f-3',
    factor_value_snapshot: 0.092,
    emission: 29.44,
    is_duplicate: false,
    emission_factors: { name: '화물 운송', scope: 'Scope3', unit: 'ton-km' },
  },
  {
    id: 'a-5',
    date: '2025-05-02',
    type: '전기',
    description: '5월 사무실 전력 사용량',
    amount: 13100,
    unit: 'kWh',
    factor_id: 'f-1',
    factor_value_snapshot: 0.4781,
    emission: 6263.11,
    is_duplicate: false,
    emission_factors: { name: '한전 전력', scope: 'Scope2', unit: 'kWh' },
  },
  {
    id: 'a-6',
    date: '2025-05-15',
    type: '원소재',
    description: '강철 원자재 입고',
    amount: 1200,
    unit: 'kg',
    factor_id: 'f-2',
    factor_value_snapshot: 8.14,
    emission: 9768.0,
    is_duplicate: false,
    emission_factors: { name: '알루미늄 원자재', scope: 'Scope3', unit: 'kg' },
  },
  {
    id: 'a-7',
    date: '2025-05-22',
    type: '운송',
    description: '원자재 배송',
    amount: 540,
    unit: 'ton-km',
    factor_id: 'f-3',
    factor_value_snapshot: 0.092,
    emission: 49.68,
    is_duplicate: false,
    emission_factors: { name: '화물 운송', scope: 'Scope3', unit: 'ton-km' },
  },
  {
    id: 'a-8',
    date: '2025-05-28',
    type: '운송',
    description: '5월 추가 화물 배송',
    amount: 210,
    unit: 'ton-km',
    factor_id: 'f-3',
    factor_value_snapshot: 0.092,
    emission: 19.32,
    is_duplicate: true,
    emission_factors: { name: '화물 운송', scope: 'Scope3', unit: 'ton-km' },
  },
  {
    id: 'a-9',
    date: '2025-05-30',
    type: '운송',
    description: '5월 임시 배송 측정',
    amount: 180,
    unit: 'ton-km',
    factor_id: 'f-3',
    factor_value_snapshot: 0.092,
    emission: 16.56,
    is_duplicate: true,
    emission_factors: { name: '화물 운송', scope: 'Scope3', unit: 'ton-km' },
  },
  {
    id: 'a-10',
    date: '2025-06-08',
    type: '전기',
    description: '6월 사무실 전력 사용량',
    amount: 13800,
    unit: 'kWh',
    factor_id: 'f-1',
    factor_value_snapshot: 0.4781,
    emission: 6597.78,
    is_duplicate: false,
    emission_factors: { name: '한전 전력', scope: 'Scope2', unit: 'kWh' },
  },
  {
    id: 'a-11',
    date: '2025-06-19',
    type: '원소재',
    description: '플라스틱 원자재 구매',
    amount: 640,
    unit: 'kg',
    factor_id: 'f-2',
    factor_value_snapshot: 8.14,
    emission: 5209.6,
    is_duplicate: false,
    emission_factors: { name: '알루미늄 원자재', scope: 'Scope3', unit: 'kg' },
  },
  {
    id: 'a-12',
    date: '2025-07-04',
    type: '전기',
    description: '7월 사무실 전력 사용량',
    amount: 14200,
    unit: 'kWh',
    factor_id: 'f-1',
    factor_value_snapshot: 0.4781,
    emission: 6789.02,
    is_duplicate: false,
    emission_factors: { name: '한전 전력', scope: 'Scope2', unit: 'kWh' },
  },
  {
    id: 'a-13',
    date: '2025-07-21',
    type: '운송',
    description: '제품 출하 운송',
    amount: 410,
    unit: 'ton-km',
    factor_id: 'f-3',
    factor_value_snapshot: 0.092,
    emission: 37.72,
    is_duplicate: false,
    emission_factors: { name: '화물 운송', scope: 'Scope3', unit: 'ton-km' },
  },
];

export default function ActivitiesPage() {
  const { showToast } = useToast();
  const [year, setYear] = useState(2025);
  const [filters, setFilters] = useState({ month: '', type: '', search: '' });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Activity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [duplicateGroup, setDuplicateGroup] = useState<DuplicateGroup | null>(
    null,
  );

  const activities = MOCK_ACTIVITIES.filter((a) => {
    if (filters.month && !a.date.startsWith(filters.month)) return false;
    if (filters.type && a.type !== filters.type) return false;
    return true;
  });

  function handleSave(body: Record<string, unknown>) {
    void body;
    showToast('success', editTarget ? '수정되었습니다.' : '저장되었습니다.');
    setCreateOpen(false);
    setEditTarget(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    showToast('success', '삭제되었습니다.');
    setDeleteTarget(null);
  }

  function openDuplicateGroup(activity: Activity) {
    const month = activity.date.slice(0, 7);
    setDuplicateGroup({
      type: activity.type,
      month,
      items: MOCK_ACTIVITIES.filter(
        (a) => a.type === activity.type && a.date.slice(0, 7) === month,
      ),
    });
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        title="Activity Data"
        subtitle="활동 데이터 관리"
        year={year}
        onYearChange={setYear}
      />
      <main className="flex-1 overflow-auto p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              활동 데이터 내역
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              사업장별 탄소 배출 활동 데이터를 기록하고 관리합니다.
            </p>
          </div>
        </div>

        <ActivityTable
          data={activities}
          filters={filters}
          onFilterChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
          onEdit={setEditTarget}
          onDelete={setDeleteTarget}
          onCreate={() => setCreateOpen(true)}
          onDuplicateClick={openDuplicateGroup}
        />

        <div className="grid grid-cols-3 gap-5 shrink-0">
          <div className="col-span-1 space-y-4">
            <BottomStats
              data={activities}
              onDuplicateClick={(g) => setDuplicateGroup(g)}
            />
          </div>
          <div className="col-span-2 bg-white rounded-xl shadow-sm p-5">
            <PeriodChart />
          </div>
        </div>
      </main>

      <ActivityModal
        isOpen={createOpen || !!editTarget}
        mode={editTarget ? 'edit' : 'create'}
        data={editTarget ?? undefined}
        factors={MOCK_FACTORS}
        onClose={() => {
          setCreateOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSave}
      />
      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      {duplicateGroup && (
        <DuplicateModal
          isOpen={!!duplicateGroup}
          duplicateGroup={duplicateGroup}
          onClose={() => setDuplicateGroup(null)}
          onResolve={() => setDuplicateGroup(null)}
        />
      )}
    </div>
  );
}
