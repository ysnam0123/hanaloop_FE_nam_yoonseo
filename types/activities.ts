export type Activity = {
  id: string;
  date: string;
  site: string;
  type: string;
  description: string;
  amount: number;
  unit: string;
  factor_id: string;
  factor_value_snapshot: number;
  emission: number;
  is_duplicate: boolean;
  emission_factors: {
    name: string;
    activity_type?: string;
    scope: string;
    unit: string;
  };
};

export interface DuplicateGroup {
  date: string;
  site: string;
  type: string;
  description: string;
  items: Activity[];
}
