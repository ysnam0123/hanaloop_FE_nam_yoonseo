import { ActivityQualityResult } from '@/lib/activityQuality';
import { DashboardData } from '@/types/dashboard';

interface Props {
  data: DashboardData;
  quality: ActivityQualityResult;
}

export default function ActionRequiredPanel({ data, quality }: Props) {
  const items = [
    ['중복 데이터', quality.summary.duplicates],
    ['계수 확인', quality.summary.missingFactors],
    ['이상치 후보', quality.summary.outliers],
    ['필수값 누락', quality.summary.missingRequired],
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-red-100 bg-red-50 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-red-700">
            보고 전 조치 필요 항목
          </h2>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-red-700">
            {quality.summary.totalIssues}건
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {items.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2"
            >
              <span className="text-sm font-semibold text-gray-700">
                {label}
              </span>
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-[#0B1A2A] p-5 text-white shadow-sm">
        <p className="text-xs font-bold text-[#6EF28C]">감축 인사이트</p>
        <h2 className="mt-3 text-lg font-black leading-snug">
          {data.insight.type
            ? `${data.insight.type}가 전체 배출량의 ${data.insight.ratio.toFixed(0)}%를 차지합니다.`
            : '데이터 입력 후 감축 인사이트가 생성됩니다.'}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          {data.insight.type
            ? `${data.insight.type} 활동량을 10% 줄이면 월 ${Math.round(data.insight.saving).toLocaleString()} kgCO₂e 감축 효과가 예상됩니다.`
            : '활동 데이터와 배출계수를 입력하면 주요 배출원과 예상 감축 효과를 확인할 수 있습니다.'}
        </p>
      </section>
    </div>
  );
}
