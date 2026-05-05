'use client';

import { useState } from 'react';
import type { Factor } from '@/app/factors/page';

const SCOPE_BADGE: Record<string, string> = {
  'Scope 1': 'bg-red-100 text-red-700',
  'Scope 2': 'bg-sky-100 text-sky-700',
  'Scope 3': 'bg-violet-100 text-violet-700',
};

const PAGE_SIZE = 10;

interface Props {
  factors: Factor[];
  onRowClick: (f: Factor) => void;
}

export default function FactorTable({ factors, onRowClick }: Props) {
  const [scope, setScope] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // 항목명 기준으로 중복 제거: 활성 항목 우선, 없으면 가장 최근 valid_from
  const dedupedByName = Object.values(
    factors.reduce<Record<string, Factor>>((acc, f) => {
      const prev = acc[f.name];
      if (
        !prev ||
        (f.is_active && !prev.is_active) ||
        (f.is_active === prev.is_active && f.valid_from > prev.valid_from)
      ) {
        acc[f.name] = f;
      }
      return acc;
    }, {}),
  );

  const filtered = dedupedByName.filter(
    (f) =>
      (!scope || f.scope === scope) &&
      (!status || (status === 'active' ? f.is_active : !f.is_active)) &&
      (!search || f.name.toLowerCase().includes(search.toLowerCase())),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-gray-500" />
        <h2 className="text-sm font-semibold text-gray-700">전체 이력</h2>
      </div>
      <div className="bg-white rounded-xl shadow-sm">
        {/* Filter row */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <select
            value={scope}
            onChange={(e) => {
              setScope(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">전체 구분</option>
            <option value="Scope 1">Scope 1</option>
            <option value="Scope 2">Scope 2</option>
            <option value="Scope 3">Scope 3</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  '항목명',
                  'Scope',
                  '계수값',
                  '단위',
                  '버전',
                  '적용 시작일',
                  '상태',
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
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-gray-400"
                  >
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => onRowClick(f)}
                    className={`border-b border-gray-50 cursor-pointer hover:bg-gray-50/60 transition-colors ${!f.is_active ? 'opacity-60' : ''}`}
                  >
                    <td
                      className={`px-4 py-3 font-medium ${f.is_active ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                      {f.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${SCOPE_BADGE[f.scope] ?? 'bg-gray-100 text-gray-500'}`}
                      >
                        {f.scope.replace('Scope ', 'SCOPE ')}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-mono ${f.is_active ? 'text-gray-800' : 'text-gray-400'}`}
                    >
                      {f.factor_value}
                    </td>
                    <td
                      className={`px-4 py-3 whitespace-nowrap ${f.is_active ? 'text-gray-600' : 'text-gray-400'}`}
                    >
                      {f.unit}
                    </td>
                    <td
                      className={`px-4 py-3 whitespace-nowrap ${f.is_active ? 'text-gray-700' : 'text-gray-400'}`}
                    >
                      {f.version}
                    </td>
                    <td
                      className={`px-4 py-3 whitespace-nowrap ${f.is_active ? 'text-gray-600' : 'text-gray-400'}`}
                    >
                      {f.valid_from}
                    </td>
                    <td className="px-4 py-3">
                      {f.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{' '}
                          현재 적용 중
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">
                          이력
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}{' '}
            factors
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
            >
              ‹
            </button>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-[#16A34A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {p}
              </button>
            ))}
            {totalPages > 5 && (
              <>
                <span className="text-gray-400 text-xs">...</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium ${page === totalPages ? 'bg-[#16A34A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {totalPages}
                </button>
              </>
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
    </div>
  );
}
