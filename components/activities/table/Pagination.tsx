interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: Props) {
  const start = Math.min((page - 1) * pageSize + 1, total);
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 shrink-0">
      <p className="text-xs text-gray-400">
        전체 {total}개 데이터 중 {start}–{end} 표시
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
        >
          ‹
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
          (p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-[#16A34A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {p}
            </button>
          ),
        )}
        {totalPages > 5 && (
          <span className="text-gray-400 text-xs px-1">...</span>
        )}
        {totalPages > 5 && (
          <button
            onClick={() => onPageChange(totalPages)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium ${page === totalPages ? 'bg-[#16A34A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {totalPages}
          </button>
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  );
}
