-- RND Gutachten: core bootstrap for a new Supabase project.
-- Run this file first, then apply the versioned migrations in supabase/migrations.

begin;

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.property_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 240),
  email text not null check (char_length(email) between 3 and 320 and position('@' in email) > 1),
  phone text check (phone is null or char_length(phone) <= 60),
  address text not null check (char_length(address) between 1 and 500),
  year integer check (year is null or year between 1000 and 2100),
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'completed')),
  documents text[] not null default '{}'::text[] check (cardinality(documents) <= 6),
  source text not null default 'request_form' check (char_length(source) between 1 and 80),
  quick_check_answers jsonb check (
    quick_check_answers is null or jsonb_typeof(quick_check_answers) = 'array'
  ),
  privacy_consent_at timestamptz not null default now(),
  privacy_policy_version text not null default '2026-07'
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(email)),
  display_name text check (display_name is null or char_length(display_name) <= 160),
  role text not null default 'admin' check (role = 'admin'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rnd_estimates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  request_id uuid not null unique references public.property_requests(id) on delete cascade,
  model_version text not null check (char_length(model_version) <= 100),
  stichtag date not null,
  building_type_code text not null check (char_length(building_type_code) <= 100),
  building_type_label text not null check (char_length(building_type_label) <= 240),
  gnd_years integer check (gnd_years is null or gnd_years between 1 and 500),
  construction_year integer not null check (construction_year between 1000 and 2100),
  actual_age integer not null check (actual_age between 0 and 1000),
  preliminary_rnd integer check (preliminary_rnd is null or preliminary_rnd between 0 and 1000),
  modernization_points_raw numeric(6, 2) not null,
  modernization_points_rounded integer not null check (modernization_points_rounded between 0 and 20),
  modified_rnd integer check (modified_rnd is null or modified_rnd between 0 and 1000),
  calculation_method text not null check (
    calculation_method in ('preliminary', 'immowertv_formula', 'manual_review')
  ),
  relative_age numeric(8, 4),
  coefficient_snapshot jsonb,
  raw_answers jsonb not null check (jsonb_typeof(raw_answers) = 'object'),
  warnings jsonb not null default '[]'::jsonb check (jsonb_typeof(warnings) = 'array'),
  result_status text not null check (result_status in ('calculated', 'manual_review')),
  result_copy_version text not null check (char_length(result_copy_version) <= 100)
);

create index if not exists property_requests_created_at_idx
  on public.property_requests (created_at desc);
create index if not exists property_requests_status_created_at_idx
  on public.property_requests (status, created_at desc);
create index if not exists property_requests_email_idx
  on public.property_requests (lower(email));
create index if not exists rnd_estimates_created_at_idx
  on public.rnd_estimates (created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists property_requests_set_updated_at on public.property_requests;
create trigger property_requests_set_updated_at
before update on public.property_requests
for each row execute function private.set_updated_at();

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function private.set_updated_at();

create or replace function private.is_team_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and active = true
      and role = 'admin'
  );
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.is_team_admin() from public, anon, authenticated;
grant execute on function private.is_team_admin() to authenticated;

alter table public.property_requests enable row level security;
alter table public.property_requests force row level security;
alter table public.admin_users enable row level security;
alter table public.admin_users force row level security;
alter table public.rnd_estimates enable row level security;
alter table public.rnd_estimates force row level security;

revoke all on table public.property_requests from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.rnd_estimates from anon, authenticated;

grant select, update, delete on table public.property_requests to authenticated;
grant select on table public.admin_users to authenticated;
grant select on table public.rnd_estimates to authenticated;

grant all on table public.property_requests to service_role;
grant all on table public.admin_users to service_role;
grant all on table public.rnd_estimates to service_role;

drop policy if exists "Admins can read own membership" on public.admin_users;
create policy "Admins can read own membership"
on public.admin_users for select
to authenticated
using ((select auth.uid()) = user_id and active = true);

drop policy if exists "Team admins can read property requests" on public.property_requests;
create policy "Team admins can read property requests"
on public.property_requests for select
to authenticated
using ((select private.is_team_admin()));

drop policy if exists "Team admins can update property requests" on public.property_requests;
create policy "Team admins can update property requests"
on public.property_requests for update
to authenticated
using ((select private.is_team_admin()))
with check ((select private.is_team_admin()));

drop policy if exists "Team admins can delete property requests" on public.property_requests;
create policy "Team admins can delete property requests"
on public.property_requests for delete
to authenticated
using ((select private.is_team_admin()));

drop policy if exists "Team admins can read RND estimates" on public.rnd_estimates;
create policy "Team admins can read RND estimates"
on public.rnd_estimates for select
to authenticated
using ((select private.is_team_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 15728640, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Team admins can read documents" on storage.objects;
create policy "Team admins can read documents"
on storage.objects for select
to authenticated
using (bucket_id = 'documents' and (select private.is_team_admin()));

drop policy if exists "Team admins can delete documents" on storage.objects;
create policy "Team admins can delete documents"
on storage.objects for delete
to authenticated
using (bucket_id = 'documents' and (select private.is_team_admin()));

-- Deliberately no anon/authenticated INSERT policy on customer tables or Storage.
-- The Next.js server uses SUPABASE_SECRET_KEY and issues restricted signed upload tokens.

comment on table public.property_requests is 'Customer RND enquiries. Server writes; authorized admins read and manage.';
comment on table public.admin_users is 'Explicit allow-list for authenticated dashboard administrators.';
comment on table public.rnd_estimates is 'Server-calculated RND protocol associated with one customer request.';

commit;
