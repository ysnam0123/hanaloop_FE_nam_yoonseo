import { Activity } from '@/types/activities';

export function calcEmission(
  amount: number,
  factorValueSnapshot: number,
): number {
  return amount * factorValueSnapshot;
}

export function calcMonthlyChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function calcYearlyChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function calcTypeRatio(
  data: Activity[],
): { type: string; ratio: number }[] {
  let total = 0;
  for (let i = 0; i < data.length; i++) {
    total = total + data[i].emission;
  }

  if (total === 0) return [];

  const types: string[] = [];
  const sums: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const type = data[i].type;
    const emission = data[i].emission;

    const idx = types.indexOf(type);
    if (idx === -1) {
      types.push(type);
      sums.push(emission);
    } else {
      sums[idx] = sums[idx] + emission;
    }
  }

  const result: { type: string; ratio: number }[] = [];
  for (let i = 0; i < types.length; i++) {
    result.push({
      type: types[i],
      ratio: (sums[i] / total) * 100,
    });
  }
  return result;
}

export function calcInsight(data: Activity[]): {
  type: string;
  ratio: number;
  saving: number;
} {
  const ratios = calcTypeRatio(data);
  if (ratios.length === 0) return { type: '', ratio: 0, saving: 0 };

  let top = ratios[0];
  for (let i = 1; i < ratios.length; i++) {
    if (ratios[i].ratio > top.ratio) {
      top = ratios[i];
    }
  }

  let typeTotal = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].type === top.type) {
      typeTotal = typeTotal + data[i].emission;
    }
  }

  const monthList: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const month = data[i].date.slice(0, 7);

    if (monthList.indexOf(month) === -1) {
      monthList.push(month);
    }
  }

  const months = monthList.length === 0 ? 1 : monthList.length;

  const saving = (typeTotal / months) * 0.1;

  return { type: top.type, ratio: top.ratio, saving };
}

export function calcCarEquivalent(emission: number): number {
  return emission / 0.21;
}
