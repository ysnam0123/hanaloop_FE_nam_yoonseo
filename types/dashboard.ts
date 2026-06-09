export interface DashboardData {
  totalEmission: number;
  prevMonthEmission: number;
  prevYearEmission: number;
  monthlyChangeRate: number | null;
  yearlyChangeRate: number | null;
  monthlyByType: ({ month: string } & Record<string, string | number>)[];
  typeRatio: { type: string; value: number; ratio: number }[];
  siteRatio: { site: string; value: number; ratio: number }[];
  scopeMonthly: {
    month: string;
    Scope1: number;
    Scope2: number;
    Scope3: number;
  }[];
  insight: {
    type: string;
    site: string;
    label: string;
    ratio: number;
    saving: number;
  };
}
