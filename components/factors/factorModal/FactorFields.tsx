import type { Factor } from '@/types/factor';

interface Props {
  mode: 'create' | 'edit';
  inputMode: 'existing' | 'new';
  activityType: string;
  activityTypeOptions: string[];
  factorValue: string;
  unit: string;
  newUnit: string;
  version: string;
  validFrom: string;
  errors: Record<string, string>;
  currentActive: Factor | null;
  showWarning: boolean;
  onActivityTypeChange: (v: string) => void;
  onFactorValueChange: (v: string) => void;
  onNewUnitChange: (v: string) => void;
  onVersionChange: (v: string) => void;
  onValidFromChange: (v: string) => void;
}

export default function FactorFields({
  mode,
  inputMode,
  activityType,
  activityTypeOptions,
  factorValue,
  unit,
  newUnit,
  version,
  validFrom,
  errors,
  currentActive,
  showWarning,
  onActivityTypeChange,
  onFactorValueChange,
  onNewUnitChange,
  onVersionChange,
  onValidFromChange,
}: Props) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-700 mb-3">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#16A34A] text-white text-[10px] font-bold mr-1.5">
          2
        </span>
        계수 정보 입력
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            활동 유형
          </label>
          <input
            list="activity-type-options"
            readOnly={inputMode === 'existing' && mode === 'create'}
            placeholder="예: 전기, 천연가스"
            value={activityType}
            onChange={(e) => onActivityTypeChange(e.target.value)}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              inputMode === 'existing' && mode === 'create'
                ? 'border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed'
                : errors.activity_type
                  ? 'border-red-400'
                  : 'border-gray-200'
            }`}
          />
          <datalist id="activity-type-options">
            {activityTypeOptions.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
          {errors.activity_type && (
            <p className="mt-1 text-xs text-red-500">
              {errors.activity_type}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            계수값
          </label>
          <input
            type="number"
            placeholder="0"
            value={factorValue}
            onChange={(e) => onFactorValueChange(e.target.value)}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.factor_value ? 'border-red-400' : 'border-gray-200'}`}
          />
          {errors.factor_value && (
            <p className="mt-1 text-xs text-red-500">{errors.factor_value}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            단위
          </label>
          {inputMode === 'existing' || mode === 'edit' ? (
            <input
              readOnly
              value={unit}
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
          ) : (
            <input
              placeholder="예: kgCO₂e/kWh"
              value={newUnit}
              onChange={(e) =>
                onNewUnitChange(
                  e.target.value
                    .replace(/CO2/g, 'CO₂')
                    .replace(/CH4/g, 'CH₄')
                    .replace(/N2O/g, 'N₂O'),
                )
              }
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.unit ? 'border-red-400' : 'border-gray-200'}`}
            />
          )}
          {errors.unit && (
            <p className="mt-1 text-xs text-red-500">{errors.unit}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            버전명
          </label>
          <input
            placeholder="예: v2025.1"
            value={version}
            onChange={(e) => onVersionChange(e.target.value)}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.version ? 'border-red-400' : 'border-gray-200'}`}
          />
          {errors.version && (
            <p className="mt-1 text-xs text-red-500">{errors.version}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            적용 시작일
          </label>
          <input
            type="date"
            value={validFrom}
            onChange={(e) => onValidFromChange(e.target.value)}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.valid_from ? 'border-red-400' : 'border-gray-200'}`}
          />
          {errors.valid_from && (
            <p className="mt-1 text-xs text-red-500">{errors.valid_from}</p>
          )}
        </div>
      </div>

      {/* 기존 항목 선택 시 경고 */}
      {showWarning && currentActive && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2.5">
          <span className="text-amber-500 text-base shrink-0 mt-0.5">▲</span>
          <div>
            <p className="text-xs font-semibold text-amber-800">
              현재 적용 중인 계수가 이력으로 변경됩니다.
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {currentActive.name}: {currentActive.factor_value}{' '}
              {currentActive.unit} ({currentActive.version},{' '}
              {currentActive.valid_from}~)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
