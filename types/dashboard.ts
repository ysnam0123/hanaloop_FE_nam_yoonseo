export interface DashboardData {
  totalEmission: number;
  prevMonthEmission: number;
  prevYearEmission: number;
  monthlyChangeRate: number;
  yearlyChangeRate: number;
  monthlyByType: {
    month: string;
    전기: number;
    원소재: number;
    운송: number;
  }[];
  typeRatio: { type: string; value: number; ratio: number }[];
  scopeMonthly: {
    month: string;
    Scope1: number;
    Scope2: number;
    Scope3: number;
  }[];
  insight: { type: string; ratio: number; saving: number };
}
