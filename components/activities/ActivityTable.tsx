'use client';

import { useRef, useState } from 'react';
import { useToast } from '@/components/layout/Toast';
import type { Activity } from '@/app/activities/page';

const BADGE: Record<string, string> = {
  전기: 'bg-sky-100 text-sky-700',
  원소재: 'bg-violet-100 text-violet-700',
  운송: 'bg-orange-100 text-orange-700',
};

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const m = String(i + 1).padStart(2, '0');
  return { label: `2025-${m}`, value: `2025-${m}` };
});

const PAGE_SIZE = 10;

interface Filters {
  month: string;
  type: string;
  search: string;
}

interface Props {
  data: Activity[];
  filters: Filters;
  onFilterChange: (f: Partial<Filters>) => void;
  onEdit: (a: Activity) => void;
  onDelete: (a: Activity) => void;
  onCreate: () => void;
  onDuplicateClick: (a: Activity) => void;
}

export default function ActivityTable({
  data,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
  onCreate,
  onDuplicateClick,
}: Props) {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);

  const filtered = data.filter(
    (a) =>
      !filters.search ||
      a.description.toLowerCase().includes(filters.search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast('warning', '임포트 기능은 추후 연동 예정입니다.');
    e.target.value = '';
  }

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col flex-1 min-h-0">
      {/* Filter + action bar */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 shrink-0">
        <div>
          <p className="text-[10px] text-gray-400 font-semibold mb-1">MONTH</p>
          <select
            value={filters.month}
            onChange={(e) => {
              onFilterChange({ month: e.target.value });
              setPage(1);
            }}
            className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">전체 기간 (All)</option>
            {MONTHS.map((m) => (
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
            onChange={(e) => {
              onFilterChange({ type: e.target.value });
              setPage(1);
            }}
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
            onChange={(e) => {
              onFilterChange({ search: e.target.value });
              setPage(1);
            }}
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

      {/* Table */}
      <div className="overflow-x-auto flex-1 min-h-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                '날짜',
                '유형',
                '설명',
                '활동량',
                '단위',
                '배출계수',
                '배출량 (kgCO₂e)',
                '관리',
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-gray-400 text-sm"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE[row.type] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-gray-700 max-w-50 truncate"
                    title={row.description}
                  >
                    {row.description}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {row.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {row.unit}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {row.factor_value_snapshot}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#16A34A] whitespace-nowrap">
                    {row.emission.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {row.is_duplicate ? (
                        <button
                          onClick={() => onDuplicateClick(row)}
                          title="같은 기간에 동일 유형 데이터가 존재합니다."
                          className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                        >
                          ⚠️
                        </button>
                      ) : (
                        <button
                          onClick={() => onEdit(row)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(row)}
                        className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 shrink-0">
        <p className="text-xs text-gray-400">
          전체 {filtered.length}개 데이터 중{' '}
          {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
          {Math.min(page * PAGE_SIZE, filtered.length)} 표시
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
          >
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
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
              onClick={() => setPage(totalPages)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium ${page === totalPages ? 'bg-[#16A34A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {totalPages}
            </button>
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
