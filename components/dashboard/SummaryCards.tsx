interface Insight {
  type: string;
  ratio: number;
  saving: number;
}

interface Props {
  totalEmission: number;
  monthlyChangeRate: number | null;
  yearlyChangeRate: number | null;
  insight: Insight;
}

export default function SummaryCards({
  totalEmission,
  monthlyChangeRate,
  yearlyChangeRate,
  insight,
}: Props) {
  const yearlyUp = yearlyChangeRate !== null && yearlyChangeRate > 0;
  const monthlyUp = monthlyChangeRate !== null && monthlyChangeRate > 0;

  return (
    <div className="grid grid-cols-4 gap-5">
      {/* 올해 총 배출량 */}
      <div className="col-span-1 bg-white rounded-xl shadow-sm p-5">
        <p className="text-xs text-gray-400 font-medium mb-3">올해 총 배출량</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[2rem] font-bold text-gray-900 leading-none">
            {Math.round(totalEmission).toLocaleString()}
          </span>
          <span className="text-sm text-gray-400">kgCO₂e</span>
        </div>
        {yearlyChangeRate === null ? (
          <p className="mt-3 text-xs font-medium text-gray-400">
            전년 데이터 없음
          </p>
        ) : (
          <p
            className={`mt-3 text-xs font-medium ${yearlyUp ? 'text-red-500' : 'text-green-600'}`}
          >
            {yearlyUp ? '↑' : '↓'} 전년 대비{' '}
            {Math.abs(yearlyChangeRate).toFixed(1)}% {yearlyUp ? '증가' : '감소'}
          </p>
        )}
      </div>

      {/* 전월 대비 증감률 */}
      <div className="col-span-1 bg-white rounded-xl shadow-sm p-5">
        <p className="text-xs text-gray-400 font-medium mb-3">
          전월 대비 증감률
        </p>
        {monthlyChangeRate === null ? (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[2rem] font-bold text-gray-300 leading-none">
                —
              </span>
            </div>
            <p className="mt-3 text-xs font-medium text-gray-400">
              직전 월 데이터 없음
            </p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[2rem] font-bold text-gray-900 leading-none">
                {monthlyChangeRate.toFixed(1)}
              </span>
              <span className="text-sm text-gray-400">%</span>
            </div>
            <p
              className={`mt-3 text-xs font-medium ${monthlyUp ? 'text-red-500' : 'text-green-600'}`}
            >
              {monthlyUp ? '↑' : '↓'} 전월 대비 {monthlyUp ? '증가' : '감소'} 중
            </p>
          </>
        )}
      </div>

      {/* 감축 인사이트 */}
      <div className="col-span-2 bg-[#F0FDF4] border border-green-100 rounded-xl p-5">
        <p className="text-xs font-semibold text-green-700 mb-3">
          💡 감축 인사이트
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {insight.type}가 전체 배출량의 {insight.ratio.toFixed(0)}%를
          차지합니다.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-1">
          {insight.type} 사용량을 10% 줄이면 월{' '}
          <span className="font-bold text-gray-900">
            {Math.round(insight.saving).toLocaleString()} kgCO₂e
          </span>{' '}
          감축 가능합니다.
        </p>
      </div>
    </div>
  );
}
