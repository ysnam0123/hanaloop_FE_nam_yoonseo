import { Factor } from '@/types/factor';
import { getFactorActivityType } from './activityTypes';

export interface FactorCoverageItem {
  type: string;
  covered: boolean;
}

export interface FactorConflict {
  name: string;
  count: number;
}

export interface FactorInsights {
  activeCount: number;
  reviewCount: number;
  coverageRate: number;
  historyCount: number;
  conflicts: FactorConflict[];
  coverage: FactorCoverageItem[];
  missingTypes: FactorCoverageItem[];
}

export function isUnitCompatible(factorUnit: string, expectedUnit: string) {
  const factor = factorUnit.replace(/\s+/g, '').toLowerCase();
  const expected = expectedUnit.replace(/\s+/g, '').toLowerCase();
  return factor === expected || factor.includes(expected) || expected.includes(factor);
}

export function getFactorInsights(
  factors: Factor[],
): FactorInsights {
  const activeFactors = factors.filter((f) => f.is_active);
  const inactiveFactors = factors.filter((f) => !f.is_active);
  const activeByName: Record<string, number> = {};

  for (let i = 0; i < activeFactors.length; i += 1) {
    const name = activeFactors[i].name;
    activeByName[name] = (activeByName[name] ?? 0) + 1;
  }

  const conflicts = Object.keys(activeByName)
    .filter((name) => activeByName[name] > 1)
    .map((name) => ({ name, count: activeByName[name] }));

  const activityTypes = Array.from(
    new Set(factors.map((factor) => getFactorActivityType(factor))),
  );

  const coverage = activityTypes.map((type) => {
    return {
      type,
      covered: activeFactors.some(
        (factor) => getFactorActivityType(factor) === type,
      ),
    };
  });

  const missingTypes = coverage.filter((item) => !item.covered);
  const coverageRate =
    coverage.length === 0
      ? 0
      : Math.round(
          (coverage.filter((item) => item.covered).length / coverage.length) *
            100,
        );

  return {
    activeCount: activeFactors.length,
    reviewCount: conflicts.length + missingTypes.length,
    coverageRate,
    historyCount: inactiveFactors.length,
    conflicts,
    coverage,
    missingTypes,
  };
}
