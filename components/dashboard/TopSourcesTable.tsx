import { DashboardData } from '@/types/dashboard';

interface Props {
  data: DashboardData;
}

export default function TopSourcesTable({ data }: Props) {
  const rows = data.typeRatio
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-black text-gray-900">주요 배출원</h2>
        <span className="text-xs font-semibold text-[#007A33]">
          유형별 상위 5개
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-green-50/60">
              {['배출원 유형', '배출량', '비중', '상태'].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-bold text-gray-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                  표시할 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.type} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {row.type}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    {(row.value / 1000).toFixed(2)} tCO₂e
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.ratio.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        row.ratio >= 30
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {row.ratio >= 30 ? '중점 관리' : '정상'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
