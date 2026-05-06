'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import ActivityTable from '@/components/activities/table/ActivityTable';
import ActivityModal from '@/components/activities/activityModal/ActivityModal';
import DeleteModal from '@/components/activities/deleteModal/DeleteModal';
import DuplicateModal from '@/components/activities/duplicateModal/DuplicateModal';
import BottomStats from '@/components/activities/bottomStats/BottomStats';
import { useToast } from '@/components/layout/Toast';
import { Activity, DuplicateGroup } from '@/types/activities';
import { Factor } from '@/types/factor';
import { useActivitiesQuery } from '@/hooks/activities/useActivities';
import { useSaveActivityMutation } from '@/hooks/activities/useSaveActivity';
import { useDeleteActivityMutation } from '@/hooks/activities/useDeleteActivity';

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

  const { data: activities = [] } = useActivitiesQuery({
    month: filters.month,
    type: filters.type,
  });

  // 등록/수정
  const saveMutation = useSaveActivityMutation({
    onSuccess: (_data, isEdit) => {
      showToast('success', isEdit ? '수정되었습니다.' : '저장되었습니다.');
      setCreateOpen(false);
      setEditTarget(null);
    },
    onError: (err) => showToast('error', err.message ?? '오류가 발생했습니다.'),
  });

  function handleSave(body: Record<string, unknown>) {
    saveMutation.mutate({ body: body, id: editTarget?.id });
  }

  // 삭제
  const deleteMutation = useDeleteActivityMutation({
    onSuccess: () => {
      showToast('success', '삭제되었습니다.');
      setDeleteTarget(null);
    },
    onError: () => {
      showToast('error', '삭제 실패');
      setDeleteTarget(null);
    },
  });

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  }

  function openDuplicateGroup(activity: Activity) {
    setDuplicateGroup({
      date: activity.date,
      type: activity.type,
      description: activity.description,
      items: activities.filter(
        (a) =>
          a.date === activity.date &&
          a.type === activity.type &&
          a.description === activity.description,
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

        <BottomStats
          data={activities}
          onDuplicateClick={(g) => setDuplicateGroup(g)}
        />
      </main>

      {/* 수정 모달 */}
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
      {/* 삭제 모달 */}
      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      {/* 중복 모달 */}
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
