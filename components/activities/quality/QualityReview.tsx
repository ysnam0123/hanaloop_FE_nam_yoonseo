'use client';

import {
  ActivityQualityStatus,
  ActivityQualityIssue,
  ActivityQualityResult,
} from '@/lib/activityQuality';

const SEVERITY_CLASS: Record<ActivityQualityIssue['severity'], string> = {
  high: 'bg-red-50 text-red-700 border-red-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  low: 'bg-sky-50 text-sky-700 border-sky-100',
};

const SEVERITY_LABEL: Record<ActivityQualityIssue['severity'], string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
};

interface Props {
  quality: ActivityQualityResult;
  onResolveIssue: (issue: ActivityQualityIssue) => void;
  onConfirmOutlier: (issue: ActivityQualityIssue) => void;
  onSelectStatus: (status: ActivityQualityStatus) => void;
}

export default function QualityReview({
  quality,
  onResolveIssue,
  onConfirmOutlier,
  onSelectStatus,
}: Props) {
  const { summary, issues } = quality;
  const cards = [
    {
      label: '중복 행',
      value: summary.duplicates,
      helper: '동일 날짜·사업장·유형·설명',
      tone: 'border-red-200',
      status: 'duplicate' as const,
    },
    {
      label: '계수 불일치',
      value: summary.factorMismatches,
      helper: '유형·단위와 계수 불일치',
      tone: 'border-rose-200',
      status: 'factorMismatch' as const,
    },
    {
      label: '계수 누락',
      value: summary.missingFactors,
      helper: '계수 ID 또는 스냅샷 누락',
      tone: 'border-amber-200',
      status: 'missingFactor' as const,
    },
    {
      label: '이상치 후보',
      value: summary.outliers,
      helper: '유형 평균 대비 과다',
      tone: 'border-sky-200',
      status: 'outlier' as const,
    },
    {
      label: '필수값 누락',
      value: summary.missingRequired,
      helper: '보고 필수 필드 점검',
      tone: 'border-rose-200',
      status: 'missingRequired' as const,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-[#007A33] bg-green-50">
              <span className="text-2xl font-black text-[#007A33]">
                {summary.score}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-bold ${
                    summary.totalIssues === 0
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {summary.totalIssues === 0 ? '검토 완료' : '확인 필요'}
                </span>
                <span className="text-sm text-gray-400">보고 준비도</span>
              </div>
              <h2 className="mt-2 text-lg font-black text-gray-900">
                데이터 품질 검토
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                현재 필터 기준 활동 데이터에서 중복, 계수 불일치, 계수 누락,
                이상치 후보를 자동으로 분류했습니다.
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-400">검토 대상</p>
            <p className="mt-1 text-2xl font-black text-gray-900">
              {summary.normal + summary.totalIssues}건
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-5 gap-4">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => onSelectStatus(card.status)}
            className={`rounded-xl border-l-4 bg-white p-4 text-left shadow-sm transition-colors hover:bg-green-50/40 ${card.tone}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">{card.label}</p>
                <p className="mt-1 text-xs text-gray-400">{card.helper}</p>
              </div>
                <p className="text-2xl font-black text-gray-900">{card.value}</p>
            </div>
          </button>
        ))}
      </section>

      <section className="rounded-xl border border-green-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-green-100 px-5 py-4">
          <h3 className="text-sm font-black text-gray-900">
            대기 중인 점검 항목
          </h3>
          <p className="text-xs text-gray-400">
            {issues.length}건의 확인 항목
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-green-50/60">
                {[
                  '심각도',
                  '이슈 유형',
                  '관련 데이터',
                  '설명',
                  '조치',
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-500 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    현재 필터 기준으로 확인 필요한 항목이 없습니다.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id} className="border-b border-gray-50">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${SEVERITY_CLASS[issue.severity]}`}
                      >
                        {SEVERITY_LABEL[issue.severity]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                      {issue.type}
                    </td>
                    <td
                      className="max-w-64 truncate px-4 py-3 text-gray-600"
                      title={issue.relatedData}
                    >
                      {issue.relatedData}
                    </td>
                  <td className="max-w-72 px-4 py-3 text-gray-600">
                    {issue.description}
                  </td>
                    <td className="px-4 py-3">
                      {issue.status === 'outlier' ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onConfirmOutlier(issue)}
                            className="rounded-lg border border-sky-200 px-2.5 py-1 text-xs font-bold text-sky-700 hover:bg-sky-50"
                          >
                            정상 확인
                          </button>
                          <button
                            onClick={() => onResolveIssue(issue)}
                            className="rounded-lg border border-green-200 px-2.5 py-1 text-xs font-bold text-[#007A33] hover:bg-green-50"
                          >
                            수정하기
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onResolveIssue(issue)}
                          className="rounded-lg border border-green-200 px-2.5 py-1 text-xs font-bold text-[#007A33] hover:bg-green-50"
                        >
                          {issue.status === 'duplicate' ? '중복 처리' : '수정하기'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
