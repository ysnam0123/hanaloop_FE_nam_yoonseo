'use client';

import { useState } from 'react';
import type { Factor } from '@/app/factors/page';

const SCOPE_BADGE: Record<string, string> = {
  'Scope 1': 'bg-red-100 text-red-700',
  'Scope 2': 'bg-sky-100 text-sky-700',
  'Scope 3': 'bg-violet-100 text-violet-700',
};

interface Props {
  isOpen: boolean;
  factor: Factor;
  historyItems: Factor[];
  onClose: () => void;
  onActivate: (f: Factor) => void;
}

export default function HistoryModal({
  isOpen,
  factor,
  historyItems,
  onClose,
  onActivate,
}: Props) {
  const [confirming, setConfirming] = useState<Factor | null>(null);

  if (!isOpen) return null;

  const sorted = [...historyItems].sort((a, b) =>
    b.valid_from.localeCompare(a.valid_from),
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-base font-bold text-gray-900">
            {factor.name} 배출계수 이력
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Factor info */}
        <div className="px-6 pb-4 flex items-center gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">항목명</p>
            <p className="text-sm font-bold text-gray-900">{factor.name}</p>
          </div>
          <div className="ml-auto">
            <p className="text-xs text-gray-500 mb-1">Scope</p>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SCOPE_BADGE[factor.scope] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {factor.scope}
            </span>
          </div>
        </div>

        {/* History table */}
        <div className="px-6 pb-2 max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['버전', '계수값', '단위', '적용 기간', '상태'].map((h) => (
                  <th
                    key={h}
                    className="pb-2 pr-4 text-left text-xs font-semibold text-gray-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((f) => (
                <tr
                  key={f.id}
                  className={`border-b border-gray-50 ${f.is_active ? 'bg-[#F0FDF4]' : ''}`}
                >
                  <td
                    className={`py-3 pr-4 font-semibold whitespace-nowrap ${f.is_active ? 'text-[#16A34A]' : 'text-gray-500'}`}
                  >
                    {f.version}
                  </td>
                  <td
                    className={`py-3 pr-4 font-mono ${f.is_active ? 'text-[#16A34A]' : 'text-gray-500'}`}
                  >
                    {f.factor_value}
                  </td>
                  <td
                    className={`py-3 pr-4 whitespace-nowrap ${f.is_active ? 'text-gray-700' : 'text-gray-400'}`}
                  >
                    {f.unit}
                  </td>
                  <td
                    className={`py-3 pr-4 whitespace-nowrap text-xs ${f.is_active ? 'text-gray-700' : 'text-gray-400'}`}
                  >
                    {f.valid_from} ~ {f.is_active ? '현재' : ''}
                  </td>
                  <td className="py-3">
                    {f.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{' '}
                        현재 적용 중
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirming(f)}
                        className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 hover:text-gray-700 transition-colors whitespace-nowrap"
                      >
                        적용하기
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Confirm dialog inline */}
        {confirming && (
          <div className="mx-6 mb-4 mt-2 bg-[#F0FDF4] border border-green-200 rounded-xl px-4 py-3">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-green-600 text-base">ℹ</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {confirming.version}을 현재 배출계수로 적용하시겠습니까?
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  적용 시점부터 새로운 계수가 데이터 산정에 반영됩니다.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onActivate(confirming);
                  setConfirming(null);
                }}
                className="px-4 py-1.5 bg-[#16A34A] text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                확인
              </button>
              <button
                onClick={() => setConfirming(null)}
                className="px-4 py-1.5 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* Close */}
        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
