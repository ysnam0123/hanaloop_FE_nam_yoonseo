import type { Activity } from '@/app/activities/page';

interface DupGroup {
  type: string;
  month: string;
  items: Activity[];
}

interface Props {
  data: Activity[];
  onDuplicateClick: (group: DupGroup) => void;
}

function getDuplicateGroups(data: Activity[]): DupGroup[] {
  const map: Record<string, Activity[]> = {};
  for (const a of data) {
    if (!a.is_duplicate) continue;
    const key = `${a.date.slice(0, 7)}__${a.type}`;
    if (!map[key]) map[key] = [];
    map[key].push(a);
  }
  return Object.entries(map).map(([key, items]) => {
    const [month, type] = key.split('__');
    return { month, type, items };
  });
}

export default function BottomStats({ data, onDuplicateClick }: Props) {
  const total = data.reduce((sum, a) => sum + a.emission, 0);
  const dupGroups = getDuplicateGroups(data);
  const dupCount = dupGroups.length;

  const now = new Date();
  const currMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const currEmission = data
    .filter((a) => a.date.startsWith(currMonth))
    .reduce((s, a) => s + a.emission, 0);
  const prevEmission = data
    .filter((a) => a.date.startsWith(prevMonth))
    .reduce((s, a) => s + a.emission, 0);
  const change =
    prevEmission > 0
      ? ((currEmission - prevEmission) / prevEmission) * 100
      : null;

  return (
    <div className="space-y-4">
      {/* 총 배출량 */}
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
        {change !== null && (
          <p
            className={`mt-2 text-xs font-medium ${change > 0 ? 'text-red-500' : 'text-green-600'}`}
          >
            {change > 0 ? '↗' : '↘'} 전월 대비 {change > 0 ? '+' : ''}
            {change.toFixed(0)}%
          </p>
        )}
      </div>

      {/* 확인 필요 */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500">확인 필요</p>
          <span className="text-lg">{dupCount > 0 ? '⚠️' : '✅'}</span>
        </div>
        {dupCount > 0 ? (
          <>
            <p className="text-2xl font-bold text-gray-900">
              중복 {dupCount}건
            </p>
            <button
              onClick={() => dupGroups[0] && onDuplicateClick(dupGroups[0])}
              className="mt-2 text-xs text-[#16A34A] font-semibold hover:underline"
            >
              항목 보기 →
            </button>
          </>
        ) : (
          <p className="text-lg font-bold text-green-600">이상 없음</p>
        )}
      </div>
    </div>
  );
}
