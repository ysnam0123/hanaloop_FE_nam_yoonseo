import { Activity } from '@/types/activities';

export type ActivityQualityStatus =
  | 'normal'
  | 'duplicate'
  | 'factorMismatch'
  | 'missingFactor'
  | 'outlier'
  | 'missingRequired';

export type ActivityQualitySeverity = 'high' | 'medium' | 'low';

export interface ActivityQualityIssue {
  id: string;
  activityId: string;
  status: Exclude<ActivityQualityStatus, 'normal'>;
  severity: ActivityQualitySeverity;
  type: string;
  relatedData: string;
  description: string;
  recommendation: string;
}

export interface ActivityQualitySummary {
  score: number;
  totalIssues: number;
  duplicates: number;
  factorMismatches: number;
  missingFactors: number;
  outliers: number;
  missingRequired: number;
  normal: number;
}

export interface ActivityQualityResult {
  summary: ActivityQualitySummary;
  issues: ActivityQualityIssue[];
  statusById: Record<string, ActivityQualityStatus>;
}

export interface ActivityQualityOptions {
  confirmedOutlierIds?: string[];
}

function hasMissingRequired(activity: Activity): boolean {
  return (
    !activity.date ||
    !activity.type ||
    !activity.description ||
    !activity.unit ||
    !Number.isFinite(activity.amount) ||
    activity.amount <= 0
  );
}

function hasMissingFactor(activity: Activity): boolean {
  return (
    !activity.factor_id ||
    !Number.isFinite(activity.factor_value_snapshot) ||
    activity.factor_value_snapshot <= 0
  );
}

function normalize(value: string | undefined): string {
  return (value ?? '').replace(/\s+/g, '').toLowerCase();
}

function hasFactorMismatch(activity: Activity): boolean {
  const factor = activity.emission_factors;
  if (!factor) return false;

  const factorName = normalize(factor.name);
  const factorActivityType = normalize(factor.activity_type);
  const description = normalize(activity.description);
  const unit = normalize(activity.unit);
  const factorUnit = normalize(factor.unit);
  const type = activity.type;
  const normalizedType = normalize(type);

  if (factorActivityType && factorActivityType !== normalizedType) {
    return true;
  }

  const nameLooksWrong =
    description.length > 0 &&
    factorName.length > 0 &&
    !factorName.includes(description) &&
    !description.includes(factorName);
  const unitLooksWrong =
    unit.length > 0 &&
    factorUnit.length > 0 &&
    !factorUnit.includes(unit) &&
    !unit.includes(factorUnit);
  const typeLooksWrong =
    (type === '원소재' && factorName.includes('운송')) ||
    (type === '운송' && (factorName.includes('플라스틱') || factorName.includes('전기'))) ||
    (type === '전기' && !factorName.includes('전기') && !factorName.includes('한국전력'));

  return typeLooksWrong || (nameLooksWrong && unitLooksWrong);
}

function getTypeAverages(data: Activity[]): Record<string, number> {
  const totals: Record<string, number> = {};
  const counts: Record<string, number> = {};

  for (let i = 0; i < data.length; i += 1) {
    const activity = data[i];
    if (!Number.isFinite(activity.amount) || activity.amount <= 0) continue;

    totals[activity.type] = (totals[activity.type] ?? 0) + activity.amount;
    counts[activity.type] = (counts[activity.type] ?? 0) + 1;
  }

  const averages: Record<string, number> = {};
  const types = Object.keys(totals);
  for (let i = 0; i < types.length; i += 1) {
    const type = types[i];
    averages[type] = totals[type] / counts[type];
  }

  return averages;
}

function isOutlier(activity: Activity, averages: Record<string, number>) {
  const average = averages[activity.type] ?? 0;
  if (average <= 0 || !Number.isFinite(activity.amount)) return false;
  return activity.amount >= average * 2.5 && activity.amount - average > 0;
}

function makeRelatedData(activity: Activity): string {
  return `${activity.date} · ${activity.site ?? '본사'} · ${activity.type} · ${activity.description}`;
}

export function getActivityQuality(
  data: Activity[],
  options: ActivityQualityOptions = {},
): ActivityQualityResult {
  const averages = getTypeAverages(data);
  const confirmedOutlierIds = new Set(options.confirmedOutlierIds ?? []);
  const issues: ActivityQualityIssue[] = [];
  const statusById: Record<string, ActivityQualityStatus> = {};

  for (let i = 0; i < data.length; i += 1) {
    const activity = data[i];
    let status: ActivityQualityStatus = 'normal';

    if (hasMissingRequired(activity)) {
      status = 'missingRequired';
      issues.push({
        id: `${activity.id}-missing-required`,
        activityId: activity.id,
        status,
        severity: 'high',
        type: '필수값 누락',
        relatedData: makeRelatedData(activity),
        description: '날짜, 유형, 설명, 활동량 또는 단위가 비어 있습니다.',
        recommendation: '활동 데이터 수정에서 누락된 필드를 보완하세요.',
      });
    } else if (hasMissingFactor(activity)) {
      status = 'missingFactor';
      issues.push({
        id: `${activity.id}-missing-factor`,
        activityId: activity.id,
        status,
        severity: 'high',
        type: '계수 누락',
        relatedData: makeRelatedData(activity),
        description: '배출계수 ID 또는 스냅샷 값이 없어 배출량 신뢰도가 낮습니다.',
        recommendation: '배출계수 탭에서 활성 계수를 확인한 뒤 데이터를 다시 저장하세요.',
      });
    } else if (hasFactorMismatch(activity)) {
      status = 'factorMismatch';
      issues.push({
        id: `${activity.id}-factor-mismatch`,
        activityId: activity.id,
        status,
        severity: 'high',
        type: '계수 불일치',
        relatedData: makeRelatedData(activity),
        description: `${activity.type} 데이터에 ${activity.emission_factors.name} 계수가 연결되어 있습니다.`,
        recommendation: '활동 데이터 수정에서 유형과 설명에 맞는 배출계수를 다시 선택하세요.',
      });
    } else if (activity.is_duplicate) {
      status = 'duplicate';
      issues.push({
        id: `${activity.id}-duplicate`,
        activityId: activity.id,
        status,
        severity: 'medium',
        type: '중복 행',
        relatedData: makeRelatedData(activity),
        description: '같은 날짜, 사업장, 유형, 설명을 가진 데이터가 2건 이상 있습니다.',
        recommendation: '중복 모달에서 실제 중복 여부를 확인하고 병합 또는 삭제하세요.',
      });
    } else if (
      !confirmedOutlierIds.has(activity.id) &&
      isOutlier(activity, averages)
    ) {
      status = 'outlier';
      issues.push({
        id: `${activity.id}-outlier`,
        activityId: activity.id,
        status,
        severity: 'low',
        type: '이상치 후보',
        relatedData: makeRelatedData(activity),
        description: '같은 활동 유형 평균 대비 활동량이 크게 높습니다.',
        recommendation: '계량기 입력값, 단위, 기간 중복 여부를 확인하세요.',
      });
    }

    statusById[activity.id] = status;
  }

  const summary = issues.reduce<ActivityQualitySummary>(
    (acc, issue) => {
      acc.totalIssues += 1;
      if (issue.status === 'duplicate') acc.duplicates += 1;
      if (issue.status === 'factorMismatch') acc.factorMismatches += 1;
      if (issue.status === 'missingFactor') acc.missingFactors += 1;
      if (issue.status === 'outlier') acc.outliers += 1;
      if (issue.status === 'missingRequired') acc.missingRequired += 1;
      return acc;
    },
    {
      score: 100,
      totalIssues: 0,
      duplicates: 0,
      factorMismatches: 0,
      missingFactors: 0,
      outliers: 0,
      missingRequired: 0,
      normal: 0,
    },
  );

  summary.normal = data.length - summary.totalIssues;
  summary.score =
    data.length === 0
      ? 0
      : Math.max(0, Math.round(100 - (summary.totalIssues / data.length) * 100));

  return { summary, issues, statusById };
}

export const QUALITY_STATUS_LABEL: Record<ActivityQualityStatus, string> = {
  normal: '정상',
  duplicate: '중복',
  factorMismatch: '계수 불일치',
  missingFactor: '계수 누락',
  outlier: '이상치',
  missingRequired: '필수값 누락',
};

export const QUALITY_STATUS_CLASS: Record<ActivityQualityStatus, string> = {
  normal: 'bg-green-50 text-green-700 border-green-100',
  duplicate: 'bg-red-50 text-red-700 border-red-100',
  factorMismatch: 'bg-rose-50 text-rose-700 border-rose-100',
  missingFactor: 'bg-amber-50 text-amber-700 border-amber-100',
  outlier: 'bg-sky-50 text-sky-700 border-sky-100',
  missingRequired: 'bg-rose-50 text-rose-700 border-rose-100',
};
