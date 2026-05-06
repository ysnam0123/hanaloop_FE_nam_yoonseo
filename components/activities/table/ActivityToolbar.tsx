'use client';

import { useRef } from 'react';

export interface Filters {
  month: string;
  type: string;
  search: string;
}

interface Props {
  year: number;
  filters: Filters;
  onFilterChange: (f: Partial<Filters>) => void;
  onCreate: () => void;
  onImport: (file: File) => void;
}

export default function ActivityToolbar({
  year,
  filters,
  onFilterChange,
  onCreate,
  onImport,
}: Props) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0');
    return { label: `${year}-${m}`, value: `${year}-${m}` };
  });
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onImport(file);
    e.target.value = ''; // 같은 파일 다시 고를 수 있도록 리셋
  }

  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-100 shrink-0">
      <div>
        <p className="text-[10px] text-gray-400 font-semibold mb-1">MONTH</p>
        <select
          value={filters.month}
          onChange={(e) => onFilterChange({ month: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">전체 기간 (All)</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-semibold mb-1">TYPE</p>
        <select
          value={filters.type}
          onChange={(e) => onFilterChange({ type: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">모든 유형</option>
          <option value="전기">전기</option>
          <option value="원소재">원소재</option>
          <option value="운송">운송</option>
        </select>
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-gray-400 font-semibold mb-1 invisible">
          SEARCH
        </p>
        <input
          placeholder="설명 검색..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div className="flex items-end gap-2 pb-0.5 mt-auto">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFile}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Excel 임포트
        </button>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#16A34A] text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          새 데이터 입력
        </button>
      </div>
    </div>
  );
}
