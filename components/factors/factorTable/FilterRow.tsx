interface Props {
  scope: string;
  status: string;
  search: string;
  onScopeChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onSearchChange: (v: string) => void;
}

export default function FilterRow({
  scope,
  status,
  search,
  onScopeChange,
  onStatusChange,
  onSearchChange,
}: Props) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-100">
      <select
        value={scope}
        onChange={(e) => onScopeChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">전체 구분</option>
        <option value="Scope1">Scope 1</option>
        <option value="Scope2">Scope 2</option>
        <option value="Scope3">Scope 3</option>
      </select>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">상태 전체</option>
        <option value="active">현재 적용 중</option>
        <option value="history">이력</option>
      </select>
      <div className="flex-1 relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          placeholder="항목명 검색"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  );
}
