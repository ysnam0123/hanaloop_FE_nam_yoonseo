import { calcEmission, calcCarEquivalent } from '@/lib/calculations';
import { Factor } from '@/types/factor';

interface Props {
  amount: string;
  factor: Factor | undefined;
  unit: string;
}

export default function EmissionPreview({ amount, factor, unit }: Props) {
  const emission = calcEmission(Number(amount) || 0, factor?.factor_value ?? 0);
  const carKm = calcCarEquivalent(emission);

  return (
    <div className="bg-[#F0FDF4] rounded-xl p-4 space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">현재 적용 계수:</span>
        <span className="text-gray-700 font-medium">
          {factor ? `${factor.factor_value} kgCO₂e/${unit}` : '—'}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">입력량 기준 예상 배출량:</span>
        <span className="text-[#16A34A] font-bold text-base">
          {emission.toFixed(2)} kgCO₂e
        </span>
      </div>
      {emission > 0 && (
        <p className="text-xs text-gray-400 mt-1">
          ≈ 승용차 약 {Math.round(carKm).toLocaleString()}km 주행과 동일
        </p>
      )}
    </div>
  );
}
