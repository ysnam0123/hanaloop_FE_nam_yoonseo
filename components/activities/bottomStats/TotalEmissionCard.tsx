interface Props {
  total: number;
  count: number;
  months: number;
}

export default function TotalEmissionCard({ total, count, months }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500">총 배출량</p>
        <span className="text-lg">🌿</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-gray-900">
          {Math.round(total).toLocaleString()}
        </span>
        <span className="text-sm text-gray-400">kgCO₂e</span>
      </div>
      {count > 0 && (
        <p className="text-xs text-gray-400 mt-2">
          {count}건 · {months}개월 데이터
        </p>
      )}
    </div>
  );
}
