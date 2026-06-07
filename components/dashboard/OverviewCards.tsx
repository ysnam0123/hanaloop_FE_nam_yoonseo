import { ActivityQualityResult } from '@/lib/activityQuality';
import { DashboardData } from '@/types/dashboard';

interface Props {
  data: DashboardData;
  quality: ActivityQualityResult;
}

function formatChange(rate: number | null) {
  if (rate === null) return '데이터 없음';
  return `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`;
}

export default function OverviewCards({ data, quality }: Props) {
  const topScope = data.scopeMonthly.reduce(
    (acc, month) => {
      const next = {
        Scope1: acc.Scope1 + month.Scope1,
        Scope2: acc.Scope2 + month.Scope2,
        Scope3: acc.Scope3 + month.Scope3,
      };
      return next;
    },
    { Scope1: 0, Scope2: 0, Scope3: 0 },
  );
  const maxScope = Object.entries(topScope).sort((a, b) => b[1] - a[1])[0];

  const cards = [
    {
      label: '총 배출량',
      value: (data.totalEmission / 1000).toFixed(1),
      unit: 'tCO₂e',
      helper: '올해 누적 배출량',
      tone: 'border-green-200',
    },
    {
      label: '전년 대비',
      value: formatChange(data.yearlyChangeRate),
      unit: '',
      helper:
        data.yearlyChangeRate && data.yearlyChangeRate > 0
          ? '증가 추세'
          : '감소 또는 데이터 없음',
      tone:
        data.yearlyChangeRate && data.yearlyChangeRate > 0
          ? 'border-red-200'
          : 'border-green-200',
    },
    {
      label: '전월 대비',
      value: formatChange(data.monthlyChangeRate),
      unit: '',
      helper: '최근 입력 월 기준',
      tone:
        data.monthlyChangeRate && data.monthlyChangeRate > 0
          ? 'border-amber-200'
          : 'border-green-200',
    },
    {
      label: '최대 Scope',
      value: maxScope ? maxScope[0].replace('Scope', 'Scope ') : '—',
      unit: '',
      helper: '누적 배출량 기준',
      tone: 'border-sky-200',
    },
    {
      label: '데이터 품질',
      value: `${quality.summary.score}`,
      unit: '점',
      helper:
        quality.summary.totalIssues > 0
          ? `${quality.summary.totalIssues}건 확인 필요`
          : '검토 완료',
      tone:
        quality.summary.totalIssues > 0 ? 'border-amber-200' : 'border-green-200',
    },
  ];

  return (
    <section className="grid grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border-l-4 bg-white p-5 shadow-sm ${card.tone}`}
        >
          <p className="text-sm font-bold text-gray-600">{card.label}</p>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-gray-950">
              {card.value}
            </span>
            {card.unit && (
              <span className="text-sm font-semibold text-gray-400">
                {card.unit}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">{card.helper}</p>
        </div>
      ))}
    </section>
  );
}
