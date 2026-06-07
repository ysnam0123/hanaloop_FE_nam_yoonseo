import { Activity } from '@/types/activities';

export interface ScopeSummary {
  scope: string;
  value: number;
  ratio: number;
}

export interface TypeSummary {
  type: string;
  value: number;
  ratio: number;
}

export interface SiteSummary {
  site: string;
  value: number;
  ratio: number;
}

export interface ReportActivitySummary {
  totalEmission: number;
  scopeSummary: ScopeSummary[];
  typeSummary: TypeSummary[];
  siteSummary: SiteSummary[];
}

export function getReportActivitySummary(
  activities: Activity[],
): ReportActivitySummary {
  const totalEmission = activities.reduce((sum, item) => sum + item.emission, 0);
  const scopeTotals: Record<string, number> = {
    Scope1: 0,
    Scope2: 0,
    Scope3: 0,
  };
  const typeTotals: Record<string, number> = {};
  const siteTotals: Record<string, number> = {};

  for (let i = 0; i < activities.length; i += 1) {
    const activity = activities[i];
    const scope = activity.emission_factors?.scope ?? '기타';
    scopeTotals[scope] = (scopeTotals[scope] ?? 0) + activity.emission;
    typeTotals[activity.type] =
      (typeTotals[activity.type] ?? 0) + activity.emission;
    const site = activity.site ?? '본사';
    siteTotals[site] = (siteTotals[site] ?? 0) + activity.emission;
  }

  const scopeSummary = Object.keys(scopeTotals).map((scope) => {
    const value = scopeTotals[scope];
    return {
      scope,
      value,
      ratio: totalEmission > 0 ? (value / totalEmission) * 100 : 0,
    };
  });

  const typeSummary = Object.keys(typeTotals)
    .map((type) => {
      const value = typeTotals[type];
      return {
        type,
        value,
        ratio: totalEmission > 0 ? (value / totalEmission) * 100 : 0,
      };
    })
    .sort((a, b) => b.value - a.value);

  const siteSummary = Object.keys(siteTotals)
    .map((site) => {
      const value = siteTotals[site];
      return {
        site,
        value,
        ratio: totalEmission > 0 ? (value / totalEmission) * 100 : 0,
      };
    })
    .sort((a, b) => b.value - a.value);

  return { totalEmission, scopeSummary, typeSummary, siteSummary };
}

export function getMonthOptions(year: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, '0');
    return {
      label: `${index + 1}월`,
      value: `${year}-${month}`,
    };
  });
}
