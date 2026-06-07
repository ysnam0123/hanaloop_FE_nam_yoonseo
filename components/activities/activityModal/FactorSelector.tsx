'use client';

import { Factor } from '@/types/factor';

interface Props {
  factors: Factor[];
  selectedFactorId: string;
  expectedUnit: string;
  error?: string;
  onSelect: (factorId: string) => void;
}

export default function FactorSelector({
  factors,
  selectedFactorId,
  expectedUnit,
  error,
  onSelect,
}: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-xs font-semibold text-gray-600">
          배출계수 선택
        </label>
        <span className="text-[11px] text-gray-400">
          기준 단위: {expectedUnit}
        </span>
      </div>

      {factors.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
          이 유형에 사용할 수 있는 활성 배출계수가 없습니다. 배출계수 탭에서
          먼저 등록해 주세요.
        </div>
      ) : (
        <div className="grid max-h-40 gap-2 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-2">
          {factors.map((factor) => {
            const selected = selectedFactorId === factor.id;
            return (
              <button
                key={factor.id}
                type="button"
                onClick={() => onSelect(factor.id)}
                className={`rounded-lg border bg-white px-3 py-2 text-left transition-colors ${
                  selected
                    ? 'border-[#16A34A] ring-2 ring-green-100'
                    : 'border-gray-100 hover:border-green-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {factor.name}
                  </p>
                  <span className="shrink-0 text-xs font-semibold text-gray-400">
                    {factor.version}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span>{factor.scope}</span>
                  <span>·</span>
                  <span>{factor.factor_value}</span>
                  <span>{factor.unit}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
