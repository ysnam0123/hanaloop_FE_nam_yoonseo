'use client';

import { useToast } from '@/components/layout/Toast';

const TYPE_ICON: Record<string, string> = {
  전기: '⚡',
  원소재: '🏭',
  운송: '🚛',
  천연가스: '🔥',
  폐기물: '♻️',
  용수: '💧',
};

interface Props {
  type: string;
  types: string[];
  onTypeChange: (type: string) => void;
  hasActiveFactor: boolean;
}

export default function TypeSelector({
  type,
  types,
  onTypeChange,
  hasActiveFactor,
}: Props) {
  const { showToast } = useToast();
  const visibleTypes = types.length > 0 ? types : [type].filter(Boolean);

  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-2">유형 선택</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {visibleTypes.map((t) => (
          <button
            key={t}
            onClick={() => onTypeChange(t)}
            className={`flex cursor-pointer items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 whitespace-nowrap transition-colors ${
              type === t
                ? 'border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            <span>{TYPE_ICON[t] ?? '•'}</span> {t}
          </button>
        ))}
        <button
          onClick={() =>
            showToast(
              'warning',
              '새 유형은 배출계수 탭에서 먼저 등록해주세요.',
            )
          }
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-dashed border-gray-200 text-gray-400 whitespace-nowrap hover:border-gray-300"
        >
          유형 추가 안내
        </button>
      </div>
      {!hasActiveFactor && (
        <p className="mt-1.5 text-xs text-amber-600">
          이 유형에 사용할 활성 배출계수가 없습니다.{' '}
          <a href="/factors" className="underline font-medium">
            배출계수 탭으로 이동 →
          </a>
        </p>
      )}
    </div>
  );
}
