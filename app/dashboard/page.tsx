'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import OverviewCards from '@/components/dashboard/OverviewCards';
import MonthlyChart from '@/components/dashboard/MonthlyChart';
import DonutChart from '@/components/dashboard/DonutChart';
import ScopeLineChart from '@/components/dashboard/ScopeLineChart';
import TopSourcesTable from '@/components/dashboard/TopSourcesTable';
import ActionRequiredPanel from '@/components/dashboard/ActionRequiredPanel';
import GoalProgressCard from '@/components/dashboard/GoalProgressCard';
import SiteEmissionPanel from '@/components/dashboard/SiteEmissionPanel';
import ReductionActionPlanner from '@/components/dashboard/ReductionActionPlanner';
import { useCalculationsQuery } from '@/hooks/dashboard/useCalculations';
import { useActivitiesQuery } from '@/hooks/activities/useActivities';
import { useGoalQuery } from '@/hooks/goals/useGoal';
import { getActivityQuality } from '@/lib/activityQuality';
import { useConfirmedOutliers } from '@/hooks/activities/useConfirmedOutliers';

export default function DashboardPage() {
  const [year, setYear] = useState(2025);
  const { data, isLoading } = useCalculationsQuery(year);
  const { data: goal } = useGoalQuery(year);
  const { data: activities = [], isLoading: activitiesLoading } =
    useActivitiesQuery({ year });
  const { confirmedOutlierIds } = useConfirmedOutliers();
  const quality = useMemo(
    () => getActivityQuality(activities, { confirmedOutlierIds }),
    [activities, confirmedOutlierIds],
  );
  const loading = isLoading || activitiesLoading;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        title="개요"
        subtitle="탄소 현황과 감축 리스크"
        year={year}
        onYearChange={setYear}
      />
      <main className="flex-1 overflow-auto p-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-sm text-gray-400">
            불러오는 중...
          </div>
        ) : data ? (
          <>
            <OverviewCards data={data} quality={quality} />
            <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-5">
              <GoalProgressCard
                goal={goal}
                currentEmission={data.totalEmission}
              />
              <SiteEmissionPanel data={data} />
            </div>
            <ReductionActionPlanner data={data} quality={quality} />
            <div className="grid grid-cols-5 gap-5">
              <div className="col-span-3 bg-white rounded-xl shadow-sm p-5">
                <MonthlyChart data={data.monthlyByType} />
              </div>
              <div className="col-span-2 bg-white rounded-xl shadow-sm p-5 flex flex-col">
                <DonutChart data={data.typeRatio} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <ScopeLineChart data={data.scopeMonthly} />
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-5">
              <TopSourcesTable data={data} />
              <ActionRequiredPanel data={data} quality={quality} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-sm text-gray-400">
            데이터가 없습니다.
          </div>
        )}
      </main>
    </div>
  );
}
