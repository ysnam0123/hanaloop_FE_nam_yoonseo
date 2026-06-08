import Link from 'next/link';
import { ActivityQualityResult } from '@/lib/activityQuality';
import { DashboardData } from '@/types/dashboard';

interface Props {
  data: DashboardData;
  quality: ActivityQualityResult;
}

export default function ReductionActionPlanner({ data, quality }: Props) {
  const insight = data.insight;
  const actions = [
    insight.label
      ? {
          title: `${insight.label} 사용량 10% 절감`,
          effect: `월 ${Math.round(insight.saving).toLocaleString()} kgCO₂e 감축 예상`,
          status: '제안',
          tone: 'bg-green-50 text-green-700',
          href: null,
        }
      : null,
    quality.summary.factorMismatches > 0
      ? {
          title: '배출계수 불일치 데이터 재검토',
          effect: `${quality.summary.factorMismatches}건의 계산 기준 확인 필요`,
          status: '검토 필요',
          tone: 'bg-rose-50 text-rose-700',
          href: '/activities?tab=quality&status=factorMismatch',
        }
      : null,
    quality.summary.duplicates > 0
      ? {
          title: '중복 활동 데이터 병합',
          effect: `${quality.summary.duplicates}개 중복 행 정리로 보고 정확도 개선`,
          status: '진행 권장',
          tone: 'bg-amber-50 text-amber-700',
          href: '/activities?tab=quality&status=duplicate',
        }
      : null,
  ].filter((action): action is NonNullable<typeof action> => action !== null);

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black text-[#007A33]">감축 액션</p>
          <h2 className="mt-1 text-lg font-black text-gray-900">
            감축 액션 플래너
          </h2>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-[#007A33]">
          {actions.length}개 제안
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {actions.length === 0 ? (
          <div className="col-span-3 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-semibold text-green-700">
            현재 데이터 기준으로 즉시 조치가 필요한 액션이 없습니다.
          </div>
        ) : (
          actions.map((action) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-black leading-snug text-gray-900">
                    {action.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${action.tone}`}
                  >
                    {action.status}
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold text-[#007A33]">
                  {action.effect}
                </p>
              </>
            );

            if (action.href) {
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-[#007A33] hover:shadow-md"
                >
                  {content}
                </Link>
              );
            }

            return (
              <article
                key={action.title}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                {content}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
