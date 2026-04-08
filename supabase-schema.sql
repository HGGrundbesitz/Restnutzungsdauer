create extension if not exists pgcrypto;

create table if not exists public.property_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  address text not null,
  year integer,
  status text default 'pending',
  documents text[] default '{}'::text[]
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.property_requests enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_team_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.role() = 'authenticated'
    and exists (
      select 1
      from public.admin_users
      where user_id = auth.uid()
         or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;

grant execute on function public.is_team_admin() to anon, authenticated;

drop policy if exists "Allow public insert" on public.property_requests;
drop policy if exists "Allow authenticated select" on public.property_requests;
drop policy if exists "Allow authenticated update" on public.property_requests;
drop policy if exists "Allow authenticated delete" on public.property_requests;
drop policy if exists "Allow public insert property requests" on public.property_requests;
drop policy if exists "Allow team admin select property requests" on public.property_requests;
drop policy if exists "Allow team admin update property requests" on public.property_requests;
drop policy if exists "Allow team admin delete property requests" on public.property_requests;
drop policy if exists "Allow authenticated select property requests" on public.property_requests;
drop policy if exists "Allow authenticated update property requests" on public.property_requests;
drop policy if exists "Allow authenticated delete property requests" on public.property_requests;

create policy "Allow public insert property requests" on public.property_requests
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow authenticated select property requests" on public.property_requests
  for select
  to authenticated
  using (true);

create policy "Allow authenticated update property requests" on public.property_requests
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Allow authenticated delete property requests" on public.property_requests
  for delete
  to authenticated
  using (true);

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "Allow public uploads" on storage.objects;
drop policy if exists "Allow authenticated downloads" on storage.objects;
drop policy if exists "Allow public request uploads" on storage.objects;
drop policy if exists "Allow team admin document access" on storage.objects;
drop policy if exists "Allow team admin document updates" on storage.objects;
drop policy if exists "Allow team admin document deletes" on storage.objects;
drop policy if exists "Allow authenticated document access" on storage.objects;
drop policy if exists "Allow authenticated document updates" on storage.objects;
drop policy if exists "Allow authenticated document deletes" on storage.objects;

create policy "Allow public request uploads" on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = 'requests'
  );

create policy "Allow authenticated document access" on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'documents'
  );

create policy "Allow authenticated document updates" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'documents'
  )
  with check (
    bucket_id = 'documents'
  );

create policy "Allow authenticated document deletes" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'documents'
  );

-- Optional: keep a list of internal team members in admin_users if you want it for later.
-- insert into public.admin_users (user_id, email)
-- select id, email
-- from auth.users
-- where email in ('alice@example.com', 'bob@example.com')
-- on conflict (user_id) do update set email = excluded.email;
