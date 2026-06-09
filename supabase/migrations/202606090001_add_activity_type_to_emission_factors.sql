alter table public.emission_factors
  add column if not exists activity_type text;

update public.emission_factors
set activity_type = case
  when coalesce(activity_type, '') <> '' then activity_type
  when lower(unit) like '%kwh%' or name like '%전기%' or name like '%한국전력%' then '전기'
  when lower(unit) like '%ton-km%' or lower(unit) like '%tonkm%' or name like '%운송%' or name like '%트럭%' then '운송'
  when lower(unit) like '%kg%' or name like '%플라스틱%' or name like '%알루미늄%' then '원소재'
  else name
end
where activity_type is null or activity_type = '';

alter table public.emission_factors
  alter column activity_type set not null;

create index if not exists emission_factors_activity_type_idx
  on public.emission_factors (activity_type);
