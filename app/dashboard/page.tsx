'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import SummaryCards from '@/components/dashboard/SummaryCards';
import MonthlyChart from '@/components/dashboard/MonthlyChart';
import DonutChart from '@/components/dashboard/DonutChart';
import ScopeLineChart from '@/components/dashboard/ScopeLineChart';

interface DashboardData {
  totalEmission: number;
  prevMonthEmission: number;
  prevYearEmission: number;
  monthlyChangeRate: number;
  yearlyChangeRate: number;
  monthlyByType: {
    month: string;
    전기: number;
    원소재: number;
    운송: number;
  }[];
  typeRatio: { type: string; value: number }[];
  scopeMonthly: {
    month: string;
    Scope1: number;
    Scope2: number;
    Scope3: number;
  }[];
  insight: { type: string; ratio: number; saving: number };
}

const MOCK_DATA: Record<number, DashboardData> = {
  2025: {
    totalEmission: 128450,
    prevMonthEmission: 11200,
    prevYearEmission: 142300,
    monthlyChangeRate: -4.8,
    yearlyChangeRate: -9.7,
    monthlyByType: [
      { month: '2025-01', 전기: 4200, 원소재: 3100, 운송: 1800 },
      { month: '2025-02', 전기: 3950, 원소재: 2980, 운송: 1720 },
      { month: '2025-03', 전기: 4480, 원소재: 3320, 운송: 1900 },
      { month: '2025-04', 전기: 4310, 원소재: 3210, 운송: 1860 },
      { month: '2025-05', 전기: 4520, 원소재: 3400, 운송: 1950 },
      { month: '2025-06', 전기: 4680, 원소재: 3550, 운송: 2010 },
      { month: '2025-07', 전기: 4890, 원소재: 3620, 운송: 2080 },
      { month: '2025-08', 전기: 4750, 원소재: 3480, 운송: 2020 },
      { month: '2025-09', 전기: 4410, 원소재: 3290, 운송: 1880 },
      { month: '2025-10', 전기: 4280, 원소재: 3150, 운송: 1820 },
      { month: '2025-11', 전기: 4120, 원소재: 3050, 운송: 1760 },
      { month: '2025-12', 전기: 3980, 원소재: 2920, 운송: 1700 },
    ],
    typeRatio: [
      { type: '전기', value: 53570 },
      { type: '원소재', value: 39070 },
      { type: '운송', value: 22500 },
    ],
    scopeMonthly: [
      { month: '2025-01', Scope1: 1800, Scope2: 4200, Scope3: 4900 },
      { month: '2025-02', Scope1: 1720, Scope2: 3950, Scope3: 4700 },
      { month: '2025-03', Scope1: 1900, Scope2: 4480, Scope3: 5220 },
      { month: '2025-04', Scope1: 1860, Scope2: 4310, Scope3: 5070 },
      { month: '2025-05', Scope1: 1950, Scope2: 4520, Scope3: 5350 },
      { month: '2025-06', Scope1: 2010, Scope2: 4680, Scope3: 5560 },
      { month: '2025-07', Scope1: 2080, Scope2: 4890, Scope3: 5700 },
      { month: '2025-08', Scope1: 2020, Scope2: 4750, Scope3: 5500 },
      { month: '2025-09', Scope1: 1880, Scope2: 4410, Scope3: 5170 },
      { month: '2025-10', Scope1: 1820, Scope2: 4280, Scope3: 4970 },
      { month: '2025-11', Scope1: 1760, Scope2: 4120, Scope3: 4810 },
      { month: '2025-12', Scope1: 1700, Scope2: 3980, Scope3: 4620 },
    ],
    insight: { type: '전기', ratio: 41.7, saving: 446 },
  },
  2024: {
    totalEmission: 142300,
    prevMonthEmission: 12400,
    prevYearEmission: 138900,
    monthlyChangeRate: 2.1,
    yearlyChangeRate: 2.4,
    monthlyByType: [
      { month: '2024-01', 전기: 4600, 원소재: 3400, 운송: 1950 },
      { month: '2024-02', 전기: 4420, 원소재: 3280, 운송: 1880 },
      { month: '2024-03', 전기: 4810, 원소재: 3560, 운송: 2050 },
      { month: '2024-04', 전기: 4720, 원소재: 3490, 운송: 2010 },
      { month: '2024-05', 전기: 4980, 원소재: 3680, 운송: 2120 },
      { month: '2024-06', 전기: 5150, 원소재: 3820, 운송: 2200 },
      { month: '2024-07', 전기: 5380, 원소재: 3950, 운송: 2280 },
      { month: '2024-08', 전기: 5210, 원소재: 3810, 운송: 2210 },
      { month: '2024-09', 전기: 4880, 원소재: 3590, 운송: 2070 },
      { month: '2024-10', 전기: 4710, 원소재: 3470, 운송: 2000 },
      { month: '2024-11', 전기: 4540, 원소재: 3360, 운송: 1930 },
      { month: '2024-12', 전기: 4380, 원소재: 3220, 운송: 1860 },
    ],
    typeRatio: [
      { type: '전기', value: 57780 },
      { type: '원소재', value: 42630 },
      { type: '운송', value: 24560 },
    ],
    scopeMonthly: [
      { month: '2024-01', Scope1: 1950, Scope2: 4600, Scope3: 5350 },
      { month: '2024-02', Scope1: 1880, Scope2: 4420, Scope3: 5160 },
      { month: '2024-03', Scope1: 2050, Scope2: 4810, Scope3: 5610 },
      { month: '2024-04', Scope1: 2010, Scope2: 4720, Scope3: 5500 },
      { month: '2024-05', Scope1: 2120, Scope2: 4980, Scope3: 5800 },
      { month: '2024-06', Scope1: 2200, Scope2: 5150, Scope3: 6020 },
      { month: '2024-07', Scope1: 2280, Scope2: 5380, Scope3: 6230 },
      { month: '2024-08', Scope1: 2210, Scope2: 5210, Scope3: 6020 },
      { month: '2024-09', Scope1: 2070, Scope2: 4880, Scope3: 5660 },
      { month: '2024-10', Scope1: 2000, Scope2: 4710, Scope3: 5470 },
      { month: '2024-11', Scope1: 1930, Scope2: 4540, Scope3: 5290 },
      { month: '2024-12', Scope1: 1860, Scope2: 4380, Scope3: 5080 },
    ],
    insight: { type: '전기', ratio: 40.6, saving: 482 },
  },
};

export default function DashboardPage() {
  const [year, setYear] = useState(2025);
  const [data, setData] = useState<DashboardData | null>(null);
  const dummyData = MOCK_DATA[year] ?? MOCK_DATA[2025];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        title="대시보드"
        subtitle="실시간 분석"
        year={year}
        onYearChange={setYear}
      />
      <main className="flex-1 overflow-auto p-6 space-y-5">
        <SummaryCards
          totalEmission={dummyData.totalEmission}
          monthlyChangeRate={dummyData.monthlyChangeRate}
          yearlyChangeRate={dummyData.yearlyChangeRate}
          insight={dummyData.insight}
        />
        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 bg-white rounded-xl shadow-sm p-5">
            <MonthlyChart data={dummyData.monthlyByType} />
          </div>
          <div className="col-span-2 bg-white rounded-xl shadow-sm p-5 flex flex-col">
            <DonutChart data={dummyData.typeRatio} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <ScopeLineChart data={dummyData.scopeMonthly} />
        </div>
      </main>
    </div>
  );
}
