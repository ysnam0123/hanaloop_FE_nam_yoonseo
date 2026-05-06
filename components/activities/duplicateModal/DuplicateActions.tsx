interface Props {
  selectedCount: number;
  onClose: () => void;
  onDelete: () => void;
  onMerge: () => void;
}

export default function DuplicateActions({
  selectedCount,
  onClose,
  onDelete,
  onMerge,
}: Props) {
  const canDelete = selectedCount >= 1;
  const canMerge = selectedCount >= 2;

  return (
    <div className="flex gap-2 px-6 pb-6">
      <button
        onClick={onClose}
        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        취소
      </button>
      <button
        onClick={onDelete}
        disabled={!canDelete}
        className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        선택 삭제
      </button>
      <button
        onClick={onMerge}
        disabled={!canMerge}
        className="flex-1 py-2.5 rounded-xl bg-[#16A34A] text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        선택 항목 합산하기
      </button>
    </div>
  );
}
