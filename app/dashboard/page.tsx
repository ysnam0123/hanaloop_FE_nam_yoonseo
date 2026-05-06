'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import SummaryCards from '@/components/dashboard/SummaryCards';
import MonthlyChart from '@/components/dashboard/MonthlyChart';
import DonutChart from '@/components/dashboard/DonutChart';
import ScopeLineChart from '@/components/dashboard/ScopeLineChart';
import { useCalculationsQuery } from '@/hooks/dashboard/useCalculations';

export default function DashboardPage() {
  const [year, setYear] = useState(2025);
  const { data, isLoading } = useCalculationsQuery(year);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        title="대시보드"
        subtitle="실시간 분석"
        year={year}
        onYearChange={setYear}
      />
      <main className="flex-1 overflow-auto p-6 space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-sm text-gray-400">
            불러오는 중...
          </div>
        ) : data ? (
          <>
            <SummaryCards
              totalEmission={data.totalEmission}
              monthlyChangeRate={data.monthlyChangeRate}
              yearlyChangeRate={data.yearlyChangeRate}
              insight={data.insight}
            />
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
