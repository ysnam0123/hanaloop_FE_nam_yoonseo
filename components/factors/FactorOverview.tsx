import { FactorInsights } from '@/lib/factorInsights';

interface Props {
  insights: FactorInsights;
}

export default function FactorOverview({ insights }: Props) {
  const metrics = [
    {
      label: '활성 계수',
      value: insights.activeCount.toLocaleString(),
      helper: '현재 계산에 사용 가능',
      tone: 'border-green-200',
    },
    {
      label: '검토 필요',
      value: insights.reviewCount.toLocaleString(),
      helper: '충돌 또는 미커버 유형',
      tone: insights.reviewCount > 0 ? 'border-red-200' : 'border-green-200',
    },
    {
      label: '활동 유형 커버리지',
      value: `${insights.coverageRate}%`,
      helper: '전기·원소재·운송 기준',
      tone: 'border-sky-200',
    },
    {
      label: '버전 이력',
      value: insights.historyCount.toLocaleString(),
      helper: '비활성 계수 버전',
      tone: 'border-violet-200',
    },
  ];

  return (
    <div className="space-y-4">
      {insights.reviewCount > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-bold text-red-700">
            배출계수 검토가 필요한 항목이 있습니다.
          </p>
          <p className="mt-1 text-sm text-red-700">
            {insights.conflicts.length > 0 &&
              `동일 항목에 활성 계수가 ${insights.conflicts.length}건 충돌합니다. `}
            {insights.missingTypes.length > 0 &&
              `${insights.missingTypes.map((item) => item.type).join(', ')} 유형의 활성 계수를 확인해 주세요.`}
          </p>
        </div>
      )}

      <section className="grid grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-xl border-l-4 bg-white p-5 shadow-sm ${metric.tone}`}
          >
            <p className="text-sm font-bold text-gray-700">{metric.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-3xl font-black text-gray-950">
                {metric.value}
              </p>
              <p className="text-xs text-gray-400">{metric.helper}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-gray-900">
              활동 유형별 계수 매칭 상태
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              현재 입력 가능한 활동 유형에 활성 배출계수가 준비되어 있는지
              확인합니다.
            </p>
          </div>
          <div className="flex gap-2">
            {insights.coverage.map((item) => (
              <span
                key={item.type}
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  item.covered
                    ? 'border-green-100 bg-green-50 text-green-700'
                    : 'border-amber-100 bg-amber-50 text-amber-700'
                }`}
              >
                {item.type} · {item.covered ? '준비됨' : '계수 필요'}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
