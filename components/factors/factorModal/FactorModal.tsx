'use client';

import { Factor } from '@/types/factor';
import { useEffect, useState } from 'react';
import NameSelector from './NameSelector';
import FactorFields from './FactorFields';

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
  const [scope, setScope] = useState('Scope1');
  const [newUnit, setNewUnit] = useState('');

  // 계수 정보
  const [factorValue, setFactorValue] = useState('');
  const [unit, setUnit] = useState('');
  const [version, setVersion] = useState('');
  const [validFrom, setValidFrom] = useState('');

  // 필드별 에러
  const [errors, setErrors] = useState<Record<string, string>>({});
  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  // 저장 후 바로 적용 여부 (create 모드에서만)
  const [applyNow, setApplyNow] = useState(true);

  // Scope 정의 표시 여부
  const [showScopeDesc, setShowScopeDesc] = useState(false);

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
      setScope('Scope1');
      setNewUnit('');
      setFactorValue('');
      setUnit('');
      setVersion('');
      setValidFrom('');
      setShowScopeDesc(false);
      setApplyNow(true);
    }
    setErrors({});
  }, [isOpen, mode, data]);

  // ─── NameSelector 핸들러 ────────────────────────────
  function handleSelectExisting(name: string) {
    setSelectedName(name);
    setInputMode('existing');
    setShowScopeDesc(true);
    clearError('name');
    const active = activeByName(name);
    if (active) {
      setScope(active.scope);
      setUnit(active.unit);
    }
  }

  function handleNewNameChange(v: string) {
    setNewName(v);
    setInputMode('new');
    setSelectedName('');
    clearError('name');
  }

  function handleNewNameFocus() {
    setInputMode('new');
    setSelectedName('');
    setUnit('');
    setScope('');
    setShowScopeDesc(false);
  }

  function handleScopeChange(s: string) {
    setScope(s);
    setShowScopeDesc(true);
    clearError('scope');
  }

  // ─── FactorFields 핸들러 ────────────────────────────
  function handleFactorValueChange(v: string) {
    setFactorValue(v);
    clearError('factor_value');
  }
  function handleNewUnitChange(v: string) {
    setNewUnit(v);
    clearError('unit');
  }
  function handleVersionChange(v: string) {
    setVersion(v);
    clearError('version');
  }
  function handleValidFromChange(v: string) {
    setValidFrom(v);
    clearError('valid_from');
  }

  // 저장
  function handleSave() {
    const errs: Record<string, string> = {};

    if (mode === 'create') {
      if (inputMode === 'new') {
        if (!newName.trim()) errs.name = '항목명을 입력해주세요';
        if (!scope) errs.scope = 'Scope를 선택해주세요';
        if (!newUnit.trim()) errs.unit = '단위를 입력해주세요';
      } else {
        if (!selectedName) errs.name = '기존 항목을 선택해주세요';
      }
    }

    if (!factorValue || Number(factorValue) <= 0) {
      errs.factor_value = '0보다 큰 값을 입력해주세요';
    }
    if (!version.trim()) errs.version = '버전명을 입력해주세요';
    if (!validFrom) errs.valid_from = '적용 시작일을 선택해주세요';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const name = inputMode === 'existing' ? selectedName : newName.trim();
    const finalUnit = inputMode === 'existing' ? unit : newUnit.trim();
    onSave({
      name,
      scope,
      factor_value: Number(factorValue),
      unit: finalUnit,
      version: version.trim(),
      valid_from: validFrom,
      ...(mode === 'create' && { is_active: applyNow }),
    });
  }

  const currentActive = selectedName
    ? (activeByName(selectedName) ?? null)
    : null;
  const showWarning =
    inputMode === 'existing' &&
    !!selectedName &&
    !!currentActive &&
    mode === 'create' &&
    applyNow;

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
            className="cursor-pointer text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {mode === 'create' && (
            <NameSelector
              factors={factors}
              inputMode={inputMode}
              selectedName={selectedName}
              newName={newName}
              scope={scope}
              showScopeDesc={showScopeDesc}
              errors={errors}
              onSelectExisting={handleSelectExisting}
              onNewNameChange={handleNewNameChange}
              onNewNameFocus={handleNewNameFocus}
              onScopeChange={handleScopeChange}
            />
          )}

          <FactorFields
            mode={mode}
            inputMode={inputMode}
            factorValue={factorValue}
            unit={unit}
            newUnit={newUnit}
            version={version}
            validFrom={validFrom}
            errors={errors}
            currentActive={currentActive}
            showWarning={showWarning}
            onFactorValueChange={handleFactorValueChange}
            onNewUnitChange={handleNewUnitChange}
            onVersionChange={handleVersionChange}
            onValidFromChange={handleValidFromChange}
          />

          {/* 바로 적용 체크박스 (create 모드에서만) */}
          {mode === 'create' && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyNow}
                onChange={(e) => setApplyNow(e.target.checked)}
                className="rounded accent-green-600"
              />
              <span className="text-sm text-gray-700">
                저장 후 바로 적용하기
              </span>
              <span className="text-xs text-gray-400">
                (해제하면 이력으로만 저장됩니다)
              </span>
            </label>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 cursor-pointer py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex-1 cursor-pointer py-2.5 rounded-xl bg-[#16A34A] text-white text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
