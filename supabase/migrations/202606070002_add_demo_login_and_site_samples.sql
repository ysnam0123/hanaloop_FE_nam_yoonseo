alter table public.app_users
  add column if not exists login_id text,
  add column if not exists password text not null default '1111';

create unique index if not exists app_users_login_id_key
  on public.app_users (login_id)
  where login_id is not null;

update public.app_users
set login_id = 'executive',
    password = '1111'
where role = 'executive'
  and (login_id is null or login_id = '');

update public.app_users
set login_id = 'operator',
    password = '1111'
where role = 'operator'
  and (login_id is null or login_id = '');

update public.activities
set site = '김포공장'
where site = '본사'
  and type = '원소재'
  and date between '2025-02-01' and '2025-06-30';

update public.activities
set site = '부산물류센터'
where site = '본사'
  and type = '운송'
  and date between '2025-05-01' and '2025-08-31';

update public.activities
set site = '김포공장'
where site = '본사'
  and type = '전기'
  and date between '2025-04-01' and '2025-06-30';
