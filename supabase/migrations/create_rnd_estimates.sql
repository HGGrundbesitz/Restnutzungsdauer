create schema if not exists private;
revoke all on schema private from public;

create table if not exists public.rnd_estimates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  request_id uuid not null unique references public.property_requests(id) on delete cascade,
  model_version text not null,
  stichtag date not null,
  building_type_code text not null,
  building_type_label text not null,
  gnd_years integer,
  construction_year integer not null,
  actual_age integer not null,
  preliminary_rnd integer,
  modernization_points_raw numeric(6, 2) not null,
  modernization_points_rounded integer not null check (modernization_points_rounded between 0 and 20),
  modified_rnd integer,
  calculation_method text not null check (calculation_method in ('preliminary', 'immowertv_formula', 'manual_review')),
  relative_age numeric(8, 4),
  coefficient_snapshot jsonb,
  raw_answers jsonb not null,
  warnings jsonb not null default '[]'::jsonb,
  result_status text not null check (result_status in ('calculated', 'manual_review')),
  result_copy_version text not null
);

create index if not exists rnd_estimates_request_id_idx on public.rnd_estimates (request_id);
create index if not exists rnd_estimates_created_at_idx on public.rnd_estimates (created_at desc);

alter table public.rnd_estimates enable row level security;
alter table public.property_requests enable row level security;

create or replace function private.is_team_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_team_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_team_admin() to authenticated;

revoke all on table public.property_requests from anon, authenticated;
revoke all on table public.rnd_estimates from anon, authenticated;
grant select, update, delete on table public.property_requests to authenticated;
grant select on table public.rnd_estimates to authenticated;

drop policy if exists "Allow public insert property requests" on public.property_requests;
drop policy if exists "Allow authenticated select property requests" on public.property_requests;
drop policy if exists "Allow authenticated update property requests" on public.property_requests;
drop policy if exists "Allow authenticated delete property requests" on public.property_requests;
drop policy if exists "Team admins can read property requests" on public.property_requests;
drop policy if exists "Team admins can update property requests" on public.property_requests;
drop policy if exists "Team admins can delete property requests" on public.property_requests;

create policy "Team admins can read property requests" on public.property_requests
  for select to authenticated using ((select private.is_team_admin()));
create policy "Team admins can update property requests" on public.property_requests
  for update to authenticated
  using ((select private.is_team_admin()))
  with check ((select private.is_team_admin()));
create policy "Team admins can delete property requests" on public.property_requests
  for delete to authenticated using ((select private.is_team_admin()));

drop policy if exists "Team admins can read RND estimates" on public.rnd_estimates;
create policy "Team admins can read RND estimates" on public.rnd_estimates
  for select to authenticated using ((select private.is_team_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 15728640, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Allow public request uploads" on storage.objects;
drop policy if exists "Allow authenticated document access" on storage.objects;
drop policy if exists "Allow authenticated document updates" on storage.objects;
drop policy if exists "Allow authenticated document deletes" on storage.objects;
drop policy if exists "Team admins can read documents" on storage.objects;
drop policy if exists "Team admins can update documents" on storage.objects;
drop policy if exists "Team admins can delete documents" on storage.objects;

create policy "Team admins can read documents" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (select private.is_team_admin()));
create policy "Team admins can update documents" on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and (select private.is_team_admin()))
  with check (bucket_id = 'documents' and (select private.is_team_admin()));
create policy "Team admins can delete documents" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and (select private.is_team_admin()));
