'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import { useCalculationsQuery } from '@/hooks/dashboard/useCalculations';
import { useActivitiesQuery } from '@/hooks/activities/useActivities';
import { useGoalQuery } from '@/hooks/goals/useGoal';
import { getActivityQuality } from '@/lib/activityQuality';
import {
  getMonthOptions,
  getReportActivitySummary,
} from '@/lib/reportSummary';

type ReportType = 'annual' | 'monthly';

function formatChange(rate: number | null | undefined) {
  if (rate === null || rate === undefined) return '데이터 없음';
  return `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`;
}

export default function ReportsPage() {
  const [year, setYear] = useState(2025);
  const [reportType, setReportType] = useState<ReportType>('annual');
  const [month, setMonth] = useState(`${year}-05`);

  const monthOptions = getMonthOptions(year);
  const selectedMonth =
    month.startsWith(String(year)) && month ? month : monthOptions[0].value;
  const activityFilters =
    reportType === 'monthly'
      ? { year, month: selectedMonth }
      : { year, month: undefined };

  const { data: annualData, isLoading: calculationsLoading } =
    useCalculationsQuery(year);
  const { data: goal } = useGoalQuery(year);
  const { data: activities = [], isLoading: activitiesLoading } =
    useActivitiesQuery(activityFilters);

  const quality = useMemo(() => getActivityQuality(activities), [activities]);
  const activitySummary = useMemo(
    () => getReportActivitySummary(activities),
    [activities],
  );

  const loading = calculationsLoading || activitiesLoading;
  const isAnnual = reportType === 'annual';
  const title = isAnnual
    ? `${year} 탄소 배출량 관리 보고서`
    : `${year}년 ${Number(selectedMonth.slice(5, 7))}월 탄소 배출량 보고서`;
  const period = isAnnual
    ? `${year}년 1월 1일 - ${year}년 12월 31일`
    : `${selectedMonth.slice(0, 4)}년 ${Number(selectedMonth.slice(5, 7))}월`;
  const totalEmission = isAnnual
    ? (annualData?.totalEmission ?? 0)
    : activitySummary.totalEmission;
  const typeSummary = isAnnual
    ? (annualData?.typeRatio ?? [])
        .slice()
        .sort((a, b) => b.value - a.value)
        .map((item) => ({
          type: item.type,
          value: item.value,
          ratio: item.ratio,
        }))
    : activitySummary.typeSummary;
  const scopeSummary = isAnnual
    ? (() => {
        const totals = { Scope1: 0, Scope2: 0, Scope3: 0 };
        for (let i = 0; i < (annualData?.scopeMonthly.length ?? 0); i += 1) {
          const item = annualData!.scopeMonthly[i];
          totals.Scope1 += item.Scope1;
          totals.Scope2 += item.Scope2;
          totals.Scope3 += item.Scope3;
        }
        const sum = totals.Scope1 + totals.Scope2 + totals.Scope3;
        return Object.keys(totals).map((scope) => {
          const value = totals[scope as keyof typeof totals];
          return {
            scope,
            value,
            ratio: sum > 0 ? (value / sum) * 100 : 0,
          };
        });
      })()
    : activitySummary.scopeSummary;
  const siteSummary = isAnnual
    ? (annualData?.siteRatio ?? [])
    : activitySummary.siteSummary;
  const topType = typeSummary[0];
  const topSite = siteSummary[0];
  const targetGap = goal ? totalEmission - goal.target_emission : null;

  function handleYearChange(nextYear: number) {
    setYear(nextYear);
    setMonth(`${nextYear}-05`);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        title="보고서"
        subtitle="월간·연간 보고서 미리보기"
        year={year}
        onYearChange={handleYearChange}
      />
      <main className="flex-1 overflow-auto bg-[#F7FCF3] p-6">
        <div className="grid grid-cols-[320px_minmax(0,1fr)] gap-5">
          <aside className="space-y-4">
            <section className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
              <h1 className="text-base font-bold text-gray-900">보고서 설정</h1>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-green-50 p-1">
                {[
                  ['annual', '연간'],
                  ['monthly', '월간'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setReportType(value as ReportType)}
                    className={`h-9 rounded-lg text-sm font-bold transition-colors ${
                      reportType === value
                        ? 'bg-[#007A33] text-white'
                        : 'text-gray-500 hover:bg-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-500">
                    보고 연도
                  </span>
                  <select
                    value={year}
                    onChange={(event) => handleYearChange(Number(event.target.value))}
                    className="mt-1.5 h-10 w-full rounded-lg border border-green-100 bg-[#F7FCF3] px-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {[2024, 2025, 2026].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                {reportType === 'monthly' && (
                  <label className="block">
                    <span className="text-xs font-semibold text-gray-500">
                      보고 월
                    </span>
                    <select
                      value={selectedMonth}
                      onChange={(event) => setMonth(event.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-green-100 bg-[#F7FCF3] px-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {monthOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="block">
                  <span className="text-xs font-semibold text-gray-500">
                    사업장
                  </span>
                  <select className="mt-1.5 h-10 w-full rounded-lg border border-green-100 bg-[#F7FCF3] px-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>전체 사업장</option>
                  </select>
                </label>
              </div>
            </section>

            <section
              className={`rounded-xl border p-4 ${
                quality.summary.totalIssues > 0
                  ? 'border-red-200 bg-red-50'
                  : 'border-green-200 bg-green-50'
              }`}
            >
              <p
                className={`text-sm font-bold ${
                  quality.summary.totalIssues > 0
                    ? 'text-red-700'
                    : 'text-green-700'
                }`}
              >
                {quality.summary.totalIssues > 0
                  ? '데이터 확인 필요'
                  : '데이터 품질 양호'}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                보고서 내보내기 전 확인 항목 {quality.summary.totalIssues}건 ·
                품질 점수 {quality.summary.score}점
              </p>
            </section>

            <section className="space-y-2">
              {['CSV 다운로드', 'PDF 내보내기', '보고서 인쇄', '공유 링크 복사'].map(
                (action) => (
                  <button
                    key={action}
                    className="h-10 w-full rounded-lg border border-green-100 bg-white text-sm font-semibold text-gray-700 hover:bg-green-50"
                  >
                    {action}
                  </button>
                ),
              )}
            </section>
          </aside>

          <section className="min-h-[820px] rounded-xl border border-green-100 bg-white p-8 shadow-sm">
            <div className="flex items-start justify-between border-b border-gray-200 pb-6">
              <div>
                <p className="text-xs font-black text-[#007A33]">
                  HANALOOP CARBON MANAGEMENT
                </p>
                <h2 className="mt-2 text-3xl font-black text-gray-950">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-gray-500">보고 기간: {period}</p>
              </div>
              <div className="rounded-lg border border-green-100 bg-[#F7FCF3] px-5 py-4 text-right">
                <p className="text-xs text-gray-500">보고서 ID</p>
                <p className="mt-1 text-sm font-black text-[#007A33]">
                  HL-{year}-{isAnnual ? 'ANN' : selectedMonth.slice(5, 7)}-001
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex h-80 items-center justify-center text-sm text-gray-400">
                보고서 데이터를 불러오는 중...
              </div>
            ) : (
              <>
                <div className="mt-8 grid grid-cols-4 gap-4">
                  {[
                    ['총 배출량', `${(totalEmission / 1000).toFixed(1)} tCO₂e`],
                    [
                      isAnnual ? '전년 대비' : '전월 대비',
                      isAnnual
                        ? formatChange(annualData?.yearlyChangeRate)
                        : formatChange(annualData?.monthlyChangeRate),
                    ],
                    ['데이터 건수', `${activities.length.toLocaleString()}건`],
                    ['품질 점수', `${quality.summary.score}점`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-green-100 bg-[#F7FCF3] p-4"
                    >
                      <p className="text-xs font-semibold text-gray-500">
                        {label}
                      </p>
                      <p className="mt-3 text-xl font-black text-gray-950">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <section className="mt-6 rounded-lg border border-green-100 bg-green-50 p-5">
                  <h3 className="text-base font-black text-[#007A33]">
                    Executive Summary
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    {title}의 총 배출량은 {(totalEmission / 1000).toFixed(1)}{' '}
                    tCO₂e입니다. 주요 배출원은{' '}
                    {topType
                      ? `${topType.type}(${topType.ratio.toFixed(1)}%)`
                      : '데이터 없음'}
                    이며, 사업장 기준으로는{' '}
                    {topSite
                      ? `${topSite.site}(${topSite.ratio.toFixed(1)}%)`
                      : '데이터 없음'}
                    의 비중이 가장 큽니다.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    {goal
                      ? targetGap !== null && targetGap > 0
                        ? `설정된 목표 ${(
                            goal.target_emission / 1000
                          ).toFixed(1)} tCO₂e 대비 ${(
                            targetGap / 1000
                          ).toFixed(1)} tCO₂e 추가 감축이 필요합니다.`
                        : `설정된 목표 ${(
                            goal.target_emission / 1000
                          ).toFixed(1)} tCO₂e 이내로 관리되고 있습니다.`
                      : '목표설정이 아직 없어 목표 대비 평가는 제외되었습니다.'}
                  </p>
                </section>

                <div className="mt-8 grid grid-cols-3 gap-6">
                  <section>
                    <h3 className="border-l-4 border-[#007A33] pl-3 text-lg font-black text-gray-900">
                      Scope별 배출량
                    </h3>
                    <table className="mt-4 w-full text-sm">
                      <thead className="bg-green-50 text-xs text-gray-500">
                        <tr>
                          <th className="px-3 py-2 text-left">구분</th>
                          <th className="px-3 py-2 text-right">배출량</th>
                          <th className="px-3 py-2 text-right">비중</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scopeSummary.map((scope) => (
                          <tr
                            key={scope.scope}
                            className="border-b border-gray-100"
                          >
                            <td className="px-3 py-3 font-semibold">
                              {scope.scope.replace('Scope', 'Scope ')}
                            </td>
                            <td className="px-3 py-3 text-right text-gray-700">
                              {(scope.value / 1000).toFixed(2)} tCO₂e
                            </td>
                            <td className="px-3 py-3 text-right text-gray-600">
                              {scope.ratio.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>

                  <section>
                    <h3 className="border-l-4 border-sky-700 pl-3 text-lg font-black text-gray-900">
                      활동별 배출량
                    </h3>
                    <div className="mt-4 space-y-3">
                      {typeSummary.length === 0 ? (
                        <p className="text-sm text-gray-400">
                          표시할 데이터가 없습니다.
                        </p>
                      ) : (
                        typeSummary.slice(0, 5).map((source) => (
                          <div key={source.type}>
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold text-gray-700">
                                {source.type}
                              </span>
                              <span className="font-bold text-gray-900">
                                {(source.value / 1000).toFixed(1)} tCO₂e
                              </span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-green-50">
                              <div
                                className="h-2 rounded-full bg-sky-700"
                                style={{
                                  width: `${Math.min(source.ratio, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="border-l-4 border-amber-500 pl-3 text-lg font-black text-gray-900">
                      사업장별 배출량
                    </h3>
                    <div className="mt-4 space-y-3">
                      {siteSummary.length === 0 ? (
                        <p className="text-sm text-gray-400">
                          표시할 데이터가 없습니다.
                        </p>
                      ) : (
                        siteSummary.slice(0, 4).map((site) => (
                          <div key={site.site}>
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold text-gray-700">
                                {site.site}
                              </span>
                              <span className="font-bold text-gray-900">
                                {(site.value / 1000).toFixed(1)} tCO₂e
                              </span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-green-50">
                              <div
                                className="h-2 rounded-full bg-amber-500"
                                style={{
                                  width: `${Math.min(site.ratio, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                <section className="mt-8 rounded-lg bg-green-50 p-5">
                  <h3 className="text-base font-black text-[#007A33]">
                    전략적 인사이트
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    {annualData?.insight.type
                      ? `${annualData.insight.type}가 전체 배출량의 ${annualData.insight.ratio.toFixed(0)}%를 차지합니다. 해당 활동량을 10% 줄이면 월 ${Math.round(annualData.insight.saving).toLocaleString()} kgCO₂e 감축 효과가 예상됩니다.`
                      : '데이터가 입력되면 주요 배출원과 예상 감축 효과를 자동으로 요약합니다.'}
                  </p>
                </section>

                <section className="mt-8 grid grid-cols-2 gap-6 border-t border-gray-200 pt-6">
                  <div>
                    <h3 className="text-sm font-black text-gray-900">
                      데이터 품질 요약
                    </h3>
                    <ul className="mt-3 space-y-1 text-sm text-gray-600">
                      <li>중복 데이터: {quality.summary.duplicates}건</li>
                      <li>계수 확인: {quality.summary.missingFactors}건</li>
                      <li>이상치 후보: {quality.summary.outliers}건</li>
                      <li>필수값 누락: {quality.summary.missingRequired}건</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">
                      보고 전 확인
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {quality.summary.totalIssues > 0
                        ? '품질 검토 탭에서 미해결 이슈를 먼저 처리한 후 최종 보고서를 내보내는 것을 권장합니다.'
                        : '현재 선택한 기간의 데이터 품질 이슈가 없어 보고서 내보내기 준비가 완료되었습니다.'}
                    </p>
                  </div>
                </section>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
