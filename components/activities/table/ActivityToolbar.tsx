'use client';

import { useRef } from 'react';

export interface Filters {
  month: string;
  site: string;
  type: string;
  search: string;
  status: string;
}

const SITE_OPTIONS = ['본사', '김포공장', '부산물류센터'];

interface Props {
  year: number;
  filters: Filters;
  onFilterChange: (f: Partial<Filters>) => void;
  onCreate: () => void;
  onImport: (file: File) => void;
  typeOptions: string[];
}

export default function ActivityToolbar({
  year,
  filters,
  onFilterChange,
  onCreate,
  onImport,
  typeOptions,
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
        <p className="text-[10px] text-gray-400 font-semibold mb-1">기간</p>
        <select
          value={filters.month}
          onChange={(e) => onFilterChange({ month: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">전체 기간</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-semibold mb-1">유형</p>
        <select
          value={filters.type}
          onChange={(e) => onFilterChange({ type: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">모든 유형</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-semibold mb-1">사업장</p>
        <select
          value={filters.site}
          onChange={(e) => onFilterChange({ site: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">모든 사업장</option>
          {SITE_OPTIONS.map((site) => (
            <option key={site} value={site}>
              {site}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-gray-400 font-semibold mb-1 invisible">
          검색
        </p>
        <input
          placeholder="설명 검색..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-semibold mb-1">상태</p>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">모든 상태</option>
          <option value="normal">정상</option>
          <option value="duplicate">중복</option>
          <option value="factorMismatch">계수 불일치</option>
          <option value="outlier">이상치</option>
          <option value="missingFactor">계수 누락</option>
          <option value="missingRequired">필수값 누락</option>
        </select>
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
          Excel 업로드
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
          활동 데이터 추가
        </button>
      </div>
    </div>
  );
}
