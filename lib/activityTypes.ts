import type { Factor } from '@/types/factor';

export const FALLBACK_ACTIVITY_UNITS: Record<string, string> = {
  전기: 'kWh',
  원소재: 'kg',
  운송: 'ton-km',
};

export function inferActivityTypeFromFactor(factor: Pick<Factor, 'name' | 'unit'>) {
  const name = factor.name.toLowerCase();
  const unit = factor.unit.replace(/\s+/g, '').toLowerCase();

  if (unit.includes('kwh') || name.includes('전기') || name.includes('한국전력')) {
    return '전기';
  }
  if (unit.includes('ton-km') || unit.includes('tonkm') || name.includes('운송') || name.includes('트럭')) {
    return '운송';
  }
  if (unit.includes('kg') || name.includes('플라스틱') || name.includes('알루미늄')) {
    return '원소재';
  }

  return factor.name;
}

export function getFactorActivityType(factor: Factor) {
  return factor.activity_type || inferActivityTypeFromFactor(factor);
}

export function getUniqueActivityTypes(factors: Factor[], fallbackTypes: string[] = []) {
  const types: string[] = [];

  function add(type: string) {
    const trimmed = type.trim();
    if (trimmed && !types.includes(trimmed)) types.push(trimmed);
  }

  for (let i = 0; i < fallbackTypes.length; i += 1) {
    add(fallbackTypes[i]);
  }

  for (let i = 0; i < factors.length; i += 1) {
    add(getFactorActivityType(factors[i]));
  }

  return types;
}

export function getActivityUnitFromFactor(factor: Factor | undefined, activityType: string) {
  if (!factor) return FALLBACK_ACTIVITY_UNITS[activityType] ?? '';

  const unit = factor.unit.trim();
  const slashIndex = unit.lastIndexOf('/');
  if (slashIndex !== -1 && slashIndex < unit.length - 1) {
    return unit.slice(slashIndex + 1).trim();
  }

  return unit;
}
