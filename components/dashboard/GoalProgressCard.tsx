import { CarbonGoal } from '@/types/goals';

interface Props {
  goal?: CarbonGoal | null;
  currentEmission: number;
}

export default function GoalProgressCard({ goal, currentEmission }: Props) {
  if (!goal) {
    return (
      <section className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black text-[#007A33]">TARGET</p>
        <h2 className="mt-2 text-lg font-black text-gray-900">
          목표가 아직 설정되지 않았습니다
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          경영진 계정으로 로그인한 뒤 사이드바의 목표설정에서 감축 기준을
          저장하세요.
        </p>
      </section>
    );
  }

  const remaining = currentEmission - goal.target_emission;
  const progress =
    goal.baseline_emission > goal.target_emission
      ? ((goal.baseline_emission - currentEmission) /
          (goal.baseline_emission - goal.target_emission)) *
        100
      : 0;
  const clampedProgress = Math.max(0, Math.min(progress, 100));
  const achieved = currentEmission <= goal.target_emission;

  return (
    <section className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black text-[#007A33]">TARGET</p>
          <h2 className="mt-2 text-lg font-black text-gray-900">
            {goal.target_year} 감축 목표
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            기준 {goal.baseline_year}년 대비 {goal.reduction_rate}% 감축
            {goal.focus_type ? ` · ${goal.focus_type} 중점` : ''}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            achieved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {achieved ? '목표 이내' : '추가 감축 필요'}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          ['현재', currentEmission],
          ['목표', goal.target_emission],
          ['차이', Math.abs(remaining)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-green-50 px-3 py-3">
            <p className="text-xs font-bold text-gray-500">{label}</p>
            <p className="mt-1 text-lg font-black text-gray-950">
              {(Number(value) / 1000).toFixed(1)}
              <span className="ml-1 text-xs text-gray-500">tCO₂e</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
          <span>목표 진행률</span>
          <span>{clampedProgress.toFixed(0)}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-[#007A33]"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
