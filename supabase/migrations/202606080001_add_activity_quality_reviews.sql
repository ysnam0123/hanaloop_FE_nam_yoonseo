create table if not exists public.activity_quality_reviews (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  issue_type text not null check (
    issue_type in (
      'outlier',
      'duplicate',
      'factorMismatch',
      'missingFactor',
      'missingRequired'
    )
  ),
  status text not null check (status in ('confirmed', 'resolved', 'ignored')),
  reviewed_by uuid references public.app_users(id) on delete set null,
  reviewed_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  unique (activity_id, issue_type)
);

create index if not exists activity_quality_reviews_issue_status_idx
  on public.activity_quality_reviews (issue_type, status);
