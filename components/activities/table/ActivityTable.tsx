'use client';

import { useState } from 'react';
import { Activity } from '@/types/activities';
import ActivityToolbar, { type Filters } from './ActivityToolbar';
import Pagination from '@/components/common/Pagination';

const BADGE: Record<string, string> = {
  전기: 'bg-sky-100 text-sky-700',
  원소재: 'bg-violet-100 text-violet-700',
  운송: 'bg-orange-100 text-orange-700',
};

const PAGE_SIZE = 10;

interface Props {
  year: number;
  data: Activity[];
  filters: Filters;
  onFilterChange: (f: Partial<Filters>) => void;
  onEdit: (a: Activity) => void;
  onDelete: (a: Activity) => void;
  onCreate: () => void;
  onDuplicateClick: (a: Activity) => void;
  onImport: (file: File) => void;
}

export default function ActivityTable({
  year,
  data,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
  onCreate,
  onDuplicateClick,
  onImport,
}: Props) {
  const [page, setPage] = useState(1);

  function changeFilter(f: Partial<Filters>) {
    onFilterChange(f);
    setPage(1);
  }

  const filtered = data.filter(
    (a) =>
      !filters.search ||
      a.description.toLowerCase().includes(filters.search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col flex-1 min-h-0">
      <ActivityToolbar
        year={year}
        filters={filters}
        onFilterChange={changeFilter}
        onCreate={onCreate}
        onImport={onImport}
      />

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
                          className="p-1.5 text-yellow-500 cursor-pointer hover:bg-yellow-50 rounded-lg transition-colors"
                        >
                          ⚠️
                        </button>
                      ) : (
                        <button
                          onClick={() => onEdit(row)}
                          className="p-1.5 text-gray-400 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
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
                        className="p-1.5 cursor-pointer text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
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

      <Pagination
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
