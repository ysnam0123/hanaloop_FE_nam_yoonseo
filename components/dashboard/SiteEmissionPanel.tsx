import { DashboardData } from '@/types/dashboard';

interface Props {
  data: DashboardData;
}

export default function SiteEmissionPanel({ data }: Props) {
  const rows = data.siteRatio.slice(0, 4);

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-gray-900">사업장별 배출량</h2>
        <span className="text-xs font-bold text-[#007A33]">
          {rows[0] ? `${rows[0].site} 최다` : '데이터 없음'}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            표시할 사업장 데이터가 없습니다.
          </p>
        ) : (
          rows.map((row) => (
            <div key={row.site}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-800">{row.site}</span>
                <span className="font-black text-gray-950">
                  {(row.value / 1000).toFixed(1)} tCO₂e
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-green-50">
                <div
                  className="h-2 rounded-full bg-[#16A34A]"
                  style={{ width: `${Math.min(row.ratio, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs font-semibold text-gray-400">
                {row.ratio.toFixed(1)}%
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
