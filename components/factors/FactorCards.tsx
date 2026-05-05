import type { Factor } from '@/app/factors/page';

const SCOPE_BADGE: Record<string, string> = {
  'Scope 1': 'bg-red-100 text-red-700',
  'Scope 2': 'bg-sky-100 text-sky-700',
  'Scope 3': 'bg-violet-100 text-violet-700',
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

// 'use client';

// import type { Factor } from '@/app/factors/page';

// const SCOPE_BADGE: Record<string, string> = {
//   'Scope 1': 'bg-red-100 text-red-700',
//   'Scope 2': 'bg-sky-100 text-sky-700',
//   'Scope 3': 'bg-violet-100 text-violet-700',
// };

// interface Props {
//   factors: Factor[];
//   onEdit: (f: Factor) => void;
// }

// export default function FactorCards({ factors, onEdit }: Props) {
//   return (
//     <div>
//       <div className="flex items-center gap-2 mb-3">
//         <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
//         <h2 className="text-sm font-semibold text-gray-700">현재 적용 중</h2>
//       </div>
//       {factors.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-gray-400">
//           현재 적용 중인 배출계수가 없습니다.
//         </div>
//       ) : (
//         <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {factors.map((f) => (
//             <div
//               key={f.id}
//               className="bg-white rounded-xl shadow-sm p-5 border border-transparent hover:border-green-200 transition-colors"
//             >
//               <div className="flex items-start justify-between mb-3">
//                 <span
//                   className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${SCOPE_BADGE[f.scope] ?? 'bg-gray-100 text-gray-500'}`}
//                 >
//                   {f.scope.replace('Scope ', 'SCOPE ')}
//                 </span>
//                 <button
//                   onClick={() => onEdit(f)}
//                   className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//                   title="수정"
//                 >
//                   <svg
//                     width="14"
//                     height="14"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//                     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//                   </svg>
//                 </button>
//               </div>
//               <p className="text-sm font-bold text-gray-900 mb-2 truncate">
//                 {f.name}
//               </p>
//               <div className="flex items-baseline gap-1.5 mb-3">
//                 <span className="text-2xl font-bold text-gray-900 leading-none font-mono">
//                   {f.factor_value}
//                 </span>
//                 <span className="text-xs text-gray-500">kgCO₂e/{f.unit}</span>
//               </div>
//               <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
//                 <span className="font-semibold text-gray-500">{f.version}</span>
//                 <span>{f.valid_from} ~</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
