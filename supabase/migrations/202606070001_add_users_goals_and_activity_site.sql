create extension if not exists pgcrypto;

alter table public.activities
  add column if not exists site text not null default '본사';

create index if not exists activities_site_idx
  on public.activities (site);

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('executive', 'operator')),
  created_at timestamp with time zone not null default now()
);

create table if not exists public.carbon_goals (
  id uuid primary key default gen_random_uuid(),
  baseline_year integer not null,
  target_year integer not null,
  reduction_rate numeric not null check (reduction_rate >= 0),
  baseline_emission numeric not null check (baseline_emission >= 0),
  target_emission numeric not null check (target_emission >= 0),
  focus_type text,
  created_by uuid references public.app_users(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists carbon_goals_target_year_idx
  on public.carbon_goals (target_year);

insert into public.app_users (name, role)
select '김하나 CFO', 'executive'
where not exists (
  select 1 from public.app_users where role = 'executive'
);

insert into public.app_users (name, role)
select '박루프 ESG 담당자', 'operator'
where not exists (
  select 1 from public.app_users where role = 'operator'
);
