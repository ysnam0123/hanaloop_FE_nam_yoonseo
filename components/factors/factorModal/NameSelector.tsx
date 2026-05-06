import type { Factor } from '@/types/factor';

const SCOPE_DESC: Record<string, string> = {
  Scope1:
    '기업이 소유하거나 통제하는 배출원에서 직접 발생하는 온실가스 배출 (연소, 공정 등)',
  Scope2: '타사 에너지(전기, 열, 스팀 등)의 생산에서 발생하는 간접 온실가스 배출',
  Scope3: '공급망, 제품 사용, 폐기 등 가치사슬 전반의 간접 배출',
};

interface Props {
  factors: Factor[];
  inputMode: 'existing' | 'new';
  selectedName: string;
  newName: string;
  scope: string;
  showScopeDesc: boolean;
  errors: Record<string, string>;
  onSelectExisting: (name: string) => void;
  onNewNameChange: (name: string) => void;
  onNewNameFocus: () => void;
  onScopeChange: (scope: string) => void;
}

export default function NameSelector({
  factors,
  inputMode,
  selectedName,
  newName,
  scope,
  showScopeDesc,
  errors,
  onSelectExisting,
  onNewNameChange,
  onNewNameFocus,
  onScopeChange,
}: Props) {
  const uniqueNames = [...new Map(factors.map((f) => [f.name, f])).values()];

  return (
    <div>
      <p className="text-xs font-bold text-gray-700 mb-3">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#16A34A] text-white text-[10px] font-bold mr-1.5">
          1
        </span>
        항목 선택 방식
      </p>

      {/* 기존 항목 */}
      <p className="text-xs font-semibold text-gray-500 mb-2">기존 항목 선택</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {uniqueNames.map((f) => (
          <button
            key={f.name}
            onClick={() => onSelectExisting(f.name)}
            className={`shrink-0 cursor-pointer flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-colors min-w-22.5 ${
              selectedName === f.name && inputMode === 'existing'
                ? 'border-[#16A34A] bg-[#F0FDF4]'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span
              className={`text-xs font-semibold text-center leading-tight ${selectedName === f.name && inputMode === 'existing' ? 'text-[#16A34A]' : 'text-gray-600'}`}
            >
              {f.name}
            </span>
            <span className="text-[10px] text-gray-400">{f.scope}</span>
          </button>
        ))}
      </div>

      {/* OR divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">또는</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* 새 항목 직접 입력 */}
      <p className="text-xs font-semibold text-gray-500 mb-2">
        새 항목 직접 입력
      </p>
      <input
        placeholder="예: 천연가스, 항공 운송"
        value={newName}
        onFocus={onNewNameFocus}
        onChange={(e) => onNewNameChange(e.target.value)}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-1 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
      />
      {errors.name && (
        <p className="mb-2 text-xs text-red-500">{errors.name}</p>
      )}
      <div className="mb-2" />

      {/* Scope 선택 (기존 항목 선택 시 잠금) */}
      <div className="flex gap-2 mb-1">
        {['Scope1', 'Scope2', 'Scope3'].map((s) => {
          const isLocked = inputMode === 'existing';
          const isSelected = scope === s;
          return (
            <button
              key={s}
              disabled={isLocked}
              onClick={() => onScopeChange(s)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                isSelected
                  ? 'border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]'
                  : 'border-gray-200 text-gray-500'
              } ${
                isLocked
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {errors.scope && (
        <p className="mb-2 text-xs text-red-500">{errors.scope}</p>
      )}
      <div className="mb-2" />

      {/* Scope 정의 */}
      {showScopeDesc && SCOPE_DESC[scope] && (
        <div className="bg-[#F0FDF4] border border-green-100 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-green-700 mb-1">
            ℹ Scope 정의
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            {SCOPE_DESC[scope]}
          </p>
        </div>
      )}
    </div>
  );
}
