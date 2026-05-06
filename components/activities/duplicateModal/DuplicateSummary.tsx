interface Props {
  selectedCount: number;
  totalAmount: number;
  totalEmission: number;
  unit: string;
}

export default function DuplicateSummary({
  selectedCount,
  totalAmount,
  totalEmission,
  unit,
}: Props) {
  return (
    <div className="mx-6 mt-3 mb-4 flex items-center justify-between text-sm bg-gray-50 rounded-xl px-4 py-3">
      <span className="text-gray-500">
        선택한 항목:{' '}
        <span className="font-semibold text-gray-800">{selectedCount}건</span>
      </span>
      {selectedCount >= 2 && (
        <span className="text-gray-500">
          합산 시 총 활동량:{' '}
          <span className="font-semibold text-gray-800">
            {totalAmount.toFixed(1)} {unit} → {totalEmission.toFixed(2)} kgCO₂e
          </span>
        </span>
      )}
    </div>
  );
}
