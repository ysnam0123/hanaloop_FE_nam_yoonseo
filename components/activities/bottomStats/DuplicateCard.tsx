import type { DuplicateGroup } from '@/types/activities';

interface Props {
  groups: DuplicateGroup[];
  onView: (group: DuplicateGroup) => void;
}

export default function DuplicateCard({ groups, onView }: Props) {
  const count = groups.length;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500">확인 필요</p>
        <span className="text-lg">{count > 0 ? '⚠️' : '✅'}</span>
      </div>
      {count > 0 ? (
        <>
          <p className="text-2xl font-bold text-gray-900">
            중복 그룹 {count}건
          </p>
          <button
            onClick={() => groups[0] && onView(groups[0])}
            className="mt-2 text-xs text-[#16A34A] font-semibold hover:underline"
          >
            항목 보기 →
          </button>
        </>
      ) : (
        <p className="text-lg font-bold text-green-600">이상 없음</p>
      )}
    </div>
  );
}
