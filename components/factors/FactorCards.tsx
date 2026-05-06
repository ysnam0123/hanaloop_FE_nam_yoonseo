import { Factor } from '@/types/factor';

const SCOPE_BADGE: Record<string, string> = {
  Scope1: 'bg-red-100 text-red-700',
  Scope2: 'bg-sky-100 text-sky-700',
  Scope3: 'bg-violet-100 text-violet-700',
};

interface Props {
  factors: Factor[];
  onEdit: (f: Factor) => void;
  onDeactivate: (f: Factor) => void;
}

export default function FactorCards({ factors, onEdit, onDeactivate }: Props) {
  if (factors.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <h2 className="text-sm font-semibold text-gray-700">현재 적용 중</h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {factors.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-xl shadow-sm border-t-2 border-green-500 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                현재 적용 중
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {f.version}
              </span>
            </div>

            <h3 className="text-[15px] font-bold text-gray-900 mb-2 leading-tight">
              {f.name}
            </h3>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${SCOPE_BADGE[f.scope] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {f.scope}
            </span>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-gray-900">
                {f.factor_value}
              </span>
              <span className="text-xs text-gray-400">{f.unit}</span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-xs text-gray-400">{f.valid_from}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onEdit(f)}
                  className="text-xs cursor-pointer text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => onDeactivate(f)}
                  className="text-xs cursor-pointer text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
                >
                  적용 취소
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
