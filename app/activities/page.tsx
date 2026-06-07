'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import ActivityTable from '@/components/activities/table/ActivityTable';
import ActivityModal from '@/components/activities/activityModal/ActivityModal';
import DeleteModal from '@/components/activities/deleteModal/DeleteModal';
import DuplicateModal from '@/components/activities/duplicateModal/DuplicateModal';
import BottomStats from '@/components/activities/bottomStats/BottomStats';
import QualityReview from '@/components/activities/quality/QualityReview';
import { useToast } from '@/components/layout/Toast';
import { Activity, DuplicateGroup } from '@/types/activities';
import { useActivitiesQuery } from '@/hooks/activities/useActivities';
import { useSaveActivityMutation } from '@/hooks/activities/useSaveActivity';
import { useDeleteActivityMutation } from '@/hooks/activities/useDeleteActivity';
import { useImportActivitiesMutation } from '@/hooks/activities/useImportActivities';
import { useAllFactorsQuery } from '@/hooks/factors/useFactors';
import {
  ActivityQualityStatus,
  ActivityQualityIssue,
  getActivityQuality,
} from '@/lib/activityQuality';

type DataTab = 'list' | 'quality';

export default function ActivitiesPage() {
  const { showToast } = useToast();
  const [year, setYear] = useState(2025);
  const [filters, setFilters] = useState({
    month: '',
    site: '',
    type: '',
    search: '',
    status: '',
  });
  const [activeTab, setActiveTab] = useState<DataTab>('list');

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Activity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [duplicateGroup, setDuplicateGroup] = useState<DuplicateGroup | null>(
    null,
  );

  const { data: activities = [] } = useActivitiesQuery({
    year,
    month: filters.month,
    site: filters.site,
    type: filters.type,
  });
  const quality = useMemo(() => getActivityQuality(activities), [activities]);

  // 실제 DB의 활성 배출계수만 모달에 전달
  const { data: allFactors = [] } = useAllFactorsQuery();
  const activeFactors = allFactors.filter((f) => f.is_active);

  // 헤더 년도 변경 시 month 필터 리셋 (옛 년도의 month 값이 새 옵션에 없음)
  function handleYearChange(y: number) {
    setYear(y);
    setFilters((prev) => ({ ...prev, month: '' }));
  }

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

  // Excel 임포트
  const importMutation = useImportActivitiesMutation({
    onSuccess: (result) => {
      const failed = result.errors.length;
      if (failed === 0) {
        showToast('success', `${result.inserted}건 임포트 완료`);
      } else {
        showToast(
          'warning',
          `${result.inserted}건 추가 · ${failed}건 실패 (배출계수 매핑 실패 등)`,
        );
      }
    },
    onError: () => showToast('error', '임포트 실패'),
  });

  function handleImport(file: File) {
    importMutation.mutate(file);
  }

  function openDuplicateGroup(activity: Activity) {
    setDuplicateGroup({
      date: activity.date,
      type: activity.type,
      description: activity.description,
      site: activity.site,
      items: activities.filter(
        (a) =>
          a.date === activity.date &&
          a.site === activity.site &&
          a.type === activity.type &&
          a.description === activity.description,
      ),
    });
  }

  function handleResolveQualityIssue(issue: ActivityQualityIssue) {
    const activity = activities.find((a) => a.id === issue.activityId);
    if (!activity) {
      showToast('error', '관련 데이터를 찾을 수 없습니다.');
      return;
    }

    if (issue.status === 'duplicate') {
      openDuplicateGroup(activity);
      return;
    }

    setEditTarget(activity);
  }

  function handleSelectQualityStatus(status: ActivityQualityStatus) {
    setFilters((prev) => ({ ...prev, status }));
    setActiveTab('list');
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        title="데이터 허브"
        subtitle="활동 데이터 입력과 품질 검토"
        year={year}
        onYearChange={handleYearChange}
      />
      <main className="flex-1 overflow-auto p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              데이터 허브
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              활동 데이터를 입력하고 보고 전 품질 이슈를 함께 점검합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {[
            { id: 'list', label: '데이터 목록' },
            {
              id: 'quality',
              label: `품질 검토 ${quality.summary.totalIssues > 0 ? quality.summary.totalIssues : ''}`,
            },
          ].map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DataTab)}
                className={`h-9 rounded-lg px-4 text-sm font-bold transition-colors ${
                  selected
                    ? 'bg-[#0B1A2A] text-white'
                    : 'bg-white text-gray-500 border border-gray-100 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'list' ? (
          <>
            <ActivityTable
              year={year}
              data={activities}
              filters={filters}
              onFilterChange={(f) =>
                setFilters((prev) => ({ ...prev, ...f }))
              }
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              onCreate={() => setCreateOpen(true)}
              onDuplicateClick={openDuplicateGroup}
              onImport={handleImport}
              qualityStatusById={quality.statusById}
            />

            <BottomStats
              data={activities}
              onDuplicateClick={(g) => setDuplicateGroup(g)}
            />
          </>
        ) : (
          <QualityReview
            quality={quality}
            onResolveIssue={handleResolveQualityIssue}
            onSelectStatus={handleSelectQualityStatus}
          />
        )}
      </main>

      {/* 수정 모달 */}
      <ActivityModal
        isOpen={createOpen || !!editTarget}
        mode={editTarget ? 'edit' : 'create'}
        data={editTarget ?? undefined}
        factors={activeFactors}
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
