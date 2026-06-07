'use client';

import { useState } from 'react';
import { useToast } from '@/components/layout/Toast';
import type { DuplicateGroup } from '@/types/activities';
import { useMergeActivitiesMutation } from '@/hooks/activities/useMergeActivities';
import DuplicateSummary from './DuplicateSummary';
import DuplicateActions from './DuplicateActions';

interface Props {
  isOpen: boolean;
  duplicateGroup: DuplicateGroup;
  onClose: () => void;
  onResolve: () => void;
}

const BADGE: Record<string, string> = {
  전기: 'bg-sky-100 text-sky-700',
  원소재: 'bg-violet-100 text-violet-700',
  운송: 'bg-orange-100 text-orange-700',
};

export default function DuplicateModal({
  isOpen,
  duplicateGroup,
  onClose,
  onResolve,
}: Props) {
  const { showToast } = useToast();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const mergeMutation = useMergeActivitiesMutation({
    onSuccess: (vars) => {
      if (vars.action === 'delete') {
        showToast('success', `${vars.ids.length}건 삭제되었습니다.`);
      } else {
        showToast('success', '합산 완료되었습니다.');
      }
      onResolve();
    },
    onError: (vars) =>
      showToast('error', vars.action === 'delete' ? '삭제 실패' : '합산 실패'),
  });

  if (!isOpen) return null;
  const { date, site, type, description, items } = duplicateGroup;
  const allChecked = checked.size === items.length;

  function toggleAll() {
    setChecked(allChecked ? new Set() : new Set(items.map((i) => i.id)));
  }
  function toggleOne(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const selected = items.filter((i) => checked.has(i.id));
  const totalAmount = selected.reduce((s, i) => s + i.amount, 0);
  const totalEmission = selected.reduce((s, i) => s + i.emission, 0);
  const unit = items[0]?.unit ?? '';

  function handleDelete() {
    const ids: string[] = [];
    checked.forEach((id) => ids.push(id));
    mergeMutation.mutate({ ids: ids, action: 'delete' });
  }

  function handleMerge() {
    const ids: string[] = [];
    checked.forEach((id) => ids.push(id));
    mergeMutation.mutate({ ids: ids, action: 'merge' });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-1">
          <h2 className="text-base font-bold text-gray-900">
            중복 데이터 확인
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <div className="px-6 pb-4">
          <p className="text-sm font-semibold text-[#16A34A]">
            {site} · {type} · {date} · &ldquo;{description}&rdquo; 중복된 데이터{' '}
            {items.length}건이 있습니다.
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            처리할 항목을 선택 후 삭제하거나 하나로 합산할 수 있습니다.
          </p>
        </div>

        {/* Table */}
        <div className="px-6 max-h-60 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 pr-3 w-8">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="rounded accent-green-600"
                  />
                </th>
                {['날짜', '사업장', '유형', '설명', '활동량', '단위', '배출량'].map(
                  (h) => (
                    <th
                      key={h}
                      className="pb-2 pr-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50">
                  <td className="py-2.5 pr-3">
                    <input
                      type="checkbox"
                      checked={checked.has(item.id)}
                      onChange={() => toggleOne(item.id)}
                      className="rounded accent-green-600"
                    />
                  </td>
                  <td className="py-2.5 pr-3 text-gray-700 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-2.5 pr-3 text-gray-600 whitespace-nowrap">
                    {item.site ?? '본사'}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${BADGE[item.type] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td
                    className="py-2.5 pr-3 text-gray-600 max-w-25 truncate text-xs"
                    title={item.description}
                  >
                    {item.description}
                  </td>
                  <td className="py-2.5 pr-3 text-gray-700 whitespace-nowrap">
                    {item.amount.toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-3 text-gray-500 whitespace-nowrap">
                    {item.unit}
                  </td>
                  <td className="py-2.5 text-[#16A34A] font-semibold whitespace-nowrap">
                    {item.emission.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DuplicateSummary
          selectedCount={checked.size}
          totalAmount={totalAmount}
          totalEmission={totalEmission}
          unit={unit}
        />

        <DuplicateActions
          selectedCount={checked.size}
          onClose={onClose}
          onDelete={handleDelete}
          onMerge={handleMerge}
        />
      </div>
    </div>
  );
}
