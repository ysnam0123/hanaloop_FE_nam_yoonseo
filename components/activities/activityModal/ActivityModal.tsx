'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/layout/Toast';
import { Activity } from '@/types/activities';
import { Factor } from '@/types/factor';
import TypeSelector, { TYPE_UNIT } from './TypeSelector';
import EmissionPreview from './EmissionPreview';

interface Props {
  isOpen: boolean;
  mode: 'create' | 'edit';
  data?: Activity;
  factors: Factor[];
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => void;
}

export default function ActivityModal({
  isOpen,
  mode,
  data,
  factors,
  onClose,
  onSave,
}: Props) {
  const { showToast } = useToast();
  const [type, setType] = useState('전기');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && data) {
      setType(data.type);
      setDate(data.date);
      setDescription(data.description);
      setAmount(String(data.amount));
    } else {
      setType('전기');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setAmount('');
    }
    setAmountError('');
  }, [isOpen, mode, data]);

  const activeFactor = factors.find((f) => f.unit === TYPE_UNIT[type]);
  const unit = TYPE_UNIT[type] ?? '';

  function handleSave() {
    if (!amount || Number(amount) <= 0) {
      setAmountError('활동량은 0보다 커야 합니다');
      return;
    }
    if (!activeFactor) {
      showToast(
        'error',
        '이 유형의 배출계수가 없습니다. 배출계수 탭에서 먼저 등록해주세요.',
      );
      return;
    }
    onSave({
      date,
      type,
      description,
      amount: Number(amount),
      unit,
      factor_id: activeFactor.id,
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-120 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-base font-bold text-gray-900">
            {mode === 'create' ? '새 활동 데이터 입력' : '활동 데이터 수정'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <TypeSelector
            type={type}
            onTypeChange={setType}
            hasActiveFactor={!!activeFactor}
          />

          {/* 날짜 + 단위 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                날짜 선택
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                단위
              </label>
              <input
                readOnly
                value={unit}
                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              설명
            </label>
            <input
              placeholder={`예: ${type === '전기' ? '3월 전력 사용량' : type === '원소재' ? '알루미늄 잉곳 구매' : '제품 물류 배송'}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* 활동량 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              활동량
            </label>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setAmountError('');
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${amountError ? 'border-red-400' : 'border-gray-200'}`}
            />
            {amountError && (
              <p className="mt-1 text-xs text-red-500">{amountError}</p>
            )}
          </div>

          <EmissionPreview
            amount={amount}
            factor={activeFactor}
            unit={unit}
          />

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
