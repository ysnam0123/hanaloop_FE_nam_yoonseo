'use client';

import { useEffect, useState } from 'react';
import type { Factor } from '@/app/factors/page';

const SCOPE_DESC: Record<string, string> = {
  'Scope 1':
    '기업이 소유하거나 통제하는 배출원에서 직접 발생하는 온실가스 배출 (연소, 공정 등)',
  'Scope 2':
    '타사 에너지(전기, 열, 스팀 등)의 생산에서 발생하는 간접 온실가스 배출',
  'Scope 3': '공급망, 제품 사용, 폐기 등 가치사슬 전반의 간접 배출',
};

interface Props {
  isOpen: boolean;
  mode: 'create' | 'edit';
  data?: Factor;
  factors: Factor[];
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => void;
}

export default function FactorModal({
  isOpen,
  mode,
  data,
  factors,
  onClose,
  onSave,
}: Props) {
  // 기존 항목 선택 or 새 항목
  const [inputMode, setInputMode] = useState<'existing' | 'new'>('existing');
  const [selectedName, setSelectedName] = useState('');

  // 새 항목 직접 입력
  const [newName, setNewName] = useState('');
  const [scope, setScope] = useState('Scope 1');
  const [newUnit, setNewUnit] = useState('');

  // 계수 정보
  const [factorValue, setFactorValue] = useState('');
  const [unit, setUnit] = useState('');
  const [version, setVersion] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [valueError, setValueError] = useState('');

  // Scope 정의 표시 여부 (사용자가 항목/Scope를 선택했을 때만 표시)
  const [showScopeDesc, setShowScopeDesc] = useState(false);

  // 고유 이름 목록 (active factor 대표)
  const uniqueNames = [...new Map(factors.map((f) => [f.name, f])).values()];
  const activeByName = (name: string) =>
    factors.find((f) => f.name === name && f.is_active);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && data) {
      setSelectedName(data.name);
      setScope(data.scope);
      setUnit(data.unit);
      setFactorValue(String(data.factor_value));
      setVersion(data.version);
      setValidFrom(data.valid_from);
      setShowScopeDesc(true);
    } else {
      setInputMode('existing');
      setSelectedName('');
      setNewName('');
      setScope('Scope 1');
      setNewUnit('');
      setFactorValue('');
      setUnit('');
      setVersion('');
      setValidFrom('');
      setShowScopeDesc(false);
    }
    setValueError('');
  }, [isOpen, mode, data]);

  function selectExisting(name: string) {
    setSelectedName(name);
    setInputMode('existing');
    setShowScopeDesc(true);
    const active = activeByName(name);
    if (active) {
      setScope(active.scope);
      setUnit(active.unit);
    }
  }

  function handleSave() {
    if (!factorValue || Number(factorValue) <= 0) {
      setValueError('0보다 큰 값을 입력해주세요');
      return;
    }
    const name = inputMode === 'existing' ? selectedName : newName;
    const finalUnit = inputMode === 'existing' ? unit : newUnit;
    onSave({
      name,
      scope,
      factor_value: Number(factorValue),
      unit: finalUnit,
      version,
      valid_from: validFrom,
    });
  }

  const currentActive = selectedName ? activeByName(selectedName) : null;
  const showWarning =
    inputMode === 'existing' &&
    !!selectedName &&
    !!currentActive &&
    mode === 'create';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-140 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 sticky top-0 bg-white border-b border-gray-100 z-10">
          <h2 className="text-base font-bold text-gray-900">
            {mode === 'create' ? '새 배출계수 추가' : '배출계수 수정'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* ① 항목 선택 (create only) */}
          {mode === 'create' && (
            <div>
              <p className="text-xs font-bold text-gray-700 mb-3">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#16A34A] text-white text-[10px] font-bold mr-1.5">
                  1
                </span>
                항목 선택 방식
              </p>

              {/* 기존 항목 */}
              <p className="text-xs font-semibold text-gray-500 mb-2">
                기존 항목 선택
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {uniqueNames.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => selectExisting(f.name)}
                    className={`shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-colors min-w-22.5 ${
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
                onFocus={() => {
                  setInputMode('new');
                  setSelectedName('');
                  setUnit('');
                  setScope('');
                  setShowScopeDesc(false);
                }}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setInputMode('new');
                  setSelectedName('');
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
              />

              {/* Scope 선택 */}
              <div className="flex gap-2 mb-3">
                {['Scope 1', 'Scope 2', 'Scope 3'].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setScope(s);
                      setShowScopeDesc(true);
                    }}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                      scope === s && (inputMode === 'new' || mode !== 'create')
                        ? 'border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

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
          )}

          {/* ② 계수 정보 입력 */}
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
                  계수값
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={factorValue}
                  onChange={(e) => {
                    setFactorValue(e.target.value);
                    setValueError('');
                  }}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${valueError ? 'border-red-400' : 'border-gray-200'}`}
                />
                {valueError && (
                  <p className="mt-1 text-xs text-red-500">{valueError}</p>
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
                    placeholder="예: kgCO2e/kWh"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
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
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  적용 시작일
                </label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* 기존 항목 선택 시 경고 */}
            {showWarning && currentActive && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2.5">
                <span className="text-amber-500 text-base shrink-0 mt-0.5">
                  ▲
                </span>
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

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl bg-[#16A34A] text-white text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 'use client';

// import { useEffect, useState } from 'react';
// import { useToast } from '@/components/layout/Toast';
// import type { Factor } from '@/app/factors/page';

// const SCOPES = ['Scope 1', 'Scope 2', 'Scope 3'];

// interface Props {
//   isOpen: boolean;
//   mode: 'create' | 'edit';
//   data?: Factor;
//   factors: Factor[];
//   onClose: () => void;
//   onSave: (body: Record<string, unknown>) => void;
// }

// export default function FactorModal({
//   isOpen,
//   mode,
//   data,
//   factors,
//   onClose,
//   onSave,
// }: Props) {
//   const { showToast } = useToast();
//   const [name, setName] = useState('');
//   const [scope, setScope] = useState('Scope 2');
//   const [factorValue, setFactorValue] = useState('');
//   const [unit, setUnit] = useState('');
//   const [version, setVersion] = useState('');
//   const [validFrom, setValidFrom] = useState('');
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => {
//     if (!isOpen) return;
//     if (mode === 'edit' && data) {
//       setName(data.name);
//       setScope(data.scope);
//       setFactorValue(String(data.factor_value));
//       setUnit(data.unit);
//       setVersion(data.version);
//       setValidFrom(data.valid_from);
//     } else {
//       setName('');
//       setScope('Scope 2');
//       setFactorValue('');
//       setUnit('');
//       setVersion('');
//       setValidFrom(new Date().toISOString().split('T')[0]);
//     }
//     setErrors({});
//   }, [isOpen, mode, data]);

//   function handleSave() {
//     const next: Record<string, string> = {};
//     if (!name.trim()) next.name = '항목명을 입력해주세요';
//     if (!factorValue || Number(factorValue) <= 0)
//       next.factorValue = '계수값은 0보다 커야 합니다';
//     if (!unit.trim()) next.unit = '단위를 입력해주세요';
//     if (!version.trim()) next.version = '버전을 입력해주세요';
//     if (!validFrom) next.validFrom = '적용 시작일을 선택해주세요';
//     setErrors(next);
//     if (Object.keys(next).length > 0) {
//       showToast('error', '입력값을 확인해주세요.');
//       return;
//     }

//     onSave({
//       name: name.trim(),
//       scope,
//       factor_value: Number(factorValue),
//       unit: unit.trim(),
//       version: version.trim(),
//       valid_from: validFrom,
//     });
//   }

//   if (!isOpen) return null;

//   const existingNames = Array.from(new Set(factors.map((f) => f.name)));

//   return (
//     <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-xl">
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 pt-6 pb-4">
//           <h2 className="text-base font-bold text-gray-900">
//             {mode === 'create' ? '새 배출계수 추가' : '배출계수 수정'}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-lg leading-none"
//           >
//             ✕
//           </button>
//         </div>

//         <div className="px-6 pb-6 space-y-4">
//           {/* 항목명 */}
//           <div>
//             <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
//               항목명
//             </label>
//             <input
//               list="factor-names"
//               placeholder="예: 한전 전력"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
//             />
//             <datalist id="factor-names">
//               {existingNames.map((n) => (
//                 <option key={n} value={n} />
//               ))}
//             </datalist>
//             {errors.name && (
//               <p className="mt-1 text-xs text-red-500">{errors.name}</p>
//             )}
//           </div>

//           {/* Scope + 단위 */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
//                 Scope
//               </label>
//               <select
//                 value={scope}
//                 onChange={(e) => setScope(e.target.value)}
//                 className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
//               >
//                 {SCOPES.map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
//                 단위
//               </label>
//               <input
//                 placeholder="예: kWh, kg, ton-km"
//                 value={unit}
//                 onChange={(e) => setUnit(e.target.value)}
//                 className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.unit ? 'border-red-400' : 'border-gray-200'}`}
//               />
//               {errors.unit && (
//                 <p className="mt-1 text-xs text-red-500">{errors.unit}</p>
//               )}
//             </div>
//           </div>

//           {/* 계수값 */}
//           <div>
//             <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
//               계수값 (kgCO₂e/단위)
//             </label>
//             <input
//               type="number"
//               step="0.0001"
//               placeholder="0.0000"
//               value={factorValue}
//               onChange={(e) => setFactorValue(e.target.value)}
//               className={`w-full border rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.factorValue ? 'border-red-400' : 'border-gray-200'}`}
//             />
//             {errors.factorValue && (
//               <p className="mt-1 text-xs text-red-500">{errors.factorValue}</p>
//             )}
//           </div>

//           {/* 버전 + 적용 시작일 */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
//                 버전
//               </label>
//               <input
//                 placeholder="예: v2025.1"
//                 value={version}
//                 onChange={(e) => setVersion(e.target.value)}
//                 className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.version ? 'border-red-400' : 'border-gray-200'}`}
//               />
//               {errors.version && (
//                 <p className="mt-1 text-xs text-red-500">{errors.version}</p>
//               )}
//             </div>
//             <div>
//               <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
//                 적용 시작일
//               </label>
//               <input
//                 type="date"
//                 value={validFrom}
//                 onChange={(e) => setValidFrom(e.target.value)}
//                 className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.validFrom ? 'border-red-400' : 'border-gray-200'}`}
//               />
//               {errors.validFrom && (
//                 <p className="mt-1 text-xs text-red-500">{errors.validFrom}</p>
//               )}
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-2 pt-2">
//             <button
//               onClick={onClose}
//               className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
//             >
//               취소
//             </button>
//             <button
//               onClick={handleSave}
//               className="flex-1 py-2.5 rounded-xl bg-[#16A34A] text-white text-sm font-semibold hover:bg-green-700 transition-colors"
//             >
//               저장
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
