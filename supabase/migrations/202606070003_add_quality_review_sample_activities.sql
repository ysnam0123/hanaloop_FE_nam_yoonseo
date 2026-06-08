insert into public.activities (
  id,
  date,
  site,
  type,
  description,
  amount,
  unit,
  factor_id,
  factor_value_snapshot
)
values
  (
    '00000000-0000-4000-8000-000000000101',
    '2025-09-03',
    '본사',
    '전기',
    '[QA] 중복 전기 사용량',
    1200,
    'kWh',
    (select id from public.emission_factors where name = '전기(한국전력)' and is_active = true limit 1),
    (select factor_value from public.emission_factors where name = '전기(한국전력)' and is_active = true limit 1)
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    '2025-09-03',
    '본사',
    '전기',
    '[QA] 중복 전기 사용량',
    1180,
    'kWh',
    (select id from public.emission_factors where name = '전기(한국전력)' and is_active = true limit 1),
    (select factor_value from public.emission_factors where name = '전기(한국전력)' and is_active = true limit 1)
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    '2025-09-08',
    '김포공장',
    '운송',
    '[QA] 계수 누락 운송',
    80,
    'ton-km',
    (select id from public.emission_factors where name = '운송(트럭)' and is_active = true limit 1),
    0
  ),
  (
    '00000000-0000-4000-8000-000000000104',
    '2025-09-12',
    '김포공장',
    '원소재',
    '[QA] 플라스틱1 계수 불일치',
    300,
    'kg',
    (select id from public.emission_factors where name = '운송(트럭)' and is_active = true limit 1),
    (select factor_value from public.emission_factors where name = '운송(트럭)' and is_active = true limit 1)
  ),
  (
    '00000000-0000-4000-8000-000000000105',
    '2025-09-16',
    '부산물류센터',
    '전기',
    '[QA] 이상치 전력 사용량',
    80000,
    'kWh',
    (select id from public.emission_factors where name = '전기(한국전력)' and is_active = true limit 1),
    (select factor_value from public.emission_factors where name = '전기(한국전력)' and is_active = true limit 1)
  ),
  (
    '00000000-0000-4000-8000-000000000106',
    '2025-09-20',
    '본사',
    '원소재',
    '',
    1,
    'kg',
    (select id from public.emission_factors where name = '플라스틱1' and is_active = true limit 1),
    (select factor_value from public.emission_factors where name = '플라스틱1' and is_active = true limit 1)
  )
on conflict (id) do update set
  date = excluded.date,
  site = excluded.site,
  type = excluded.type,
  description = excluded.description,
  amount = excluded.amount,
  unit = excluded.unit,
  factor_id = excluded.factor_id,
  factor_value_snapshot = excluded.factor_value_snapshot;
