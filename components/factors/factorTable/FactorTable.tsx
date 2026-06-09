'use client';

import { Factor } from '@/types/factor';
import { useState } from 'react';
import FilterRow from './FilterRow';
import Pagination from '@/components/common/Pagination';
import { getFactorActivityType } from '@/lib/activityTypes';

const SCOPE_BADGE: Record<string, string> = {
  Scope1: 'bg-red-100 text-red-700',
  Scope2: 'bg-sky-100 text-sky-700',
  Scope3: 'bg-violet-100 text-violet-700',
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

  function changeScope(v: string) {
    setScope(v);
    setPage(1);
  }
  function changeStatus(v: string) {
    setStatus(v);
    setPage(1);
  }
  function changeSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

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
        <FilterRow
          scope={scope}
          status={status}
          search={search}
          onScopeChange={changeScope}
          onStatusChange={changeStatus}
          onSearchChange={changeSearch}
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  '항목명',
                  '활동 유형',
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
                    colSpan={8}
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
                    <td
                      className={`px-4 py-3 whitespace-nowrap ${f.is_active ? 'text-gray-700' : 'text-gray-400'}`}
                    >
                      {getFactorActivityType(f)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${SCOPE_BADGE[f.scope] ?? 'bg-gray-100 text-gray-500'}`}
                      >
                        {f.scope.replace(/Scope\s*(\d)/, 'SCOPE $1')}
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

        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
