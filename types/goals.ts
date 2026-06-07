export interface CarbonGoal {
  id: string;
  baseline_year: number;
  target_year: number;
  reduction_rate: number;
  baseline_emission: number;
  target_emission: number;
  focus_type: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
