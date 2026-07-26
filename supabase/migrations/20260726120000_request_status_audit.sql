-- Immutable request-status history and one atomic, server-owned status mutation.

begin;

create table if not exists public.property_request_status_audit_log (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.property_requests(id) on delete cascade,
  previous_status text
    check (previous_status is null or previous_status in ('pending', 'reviewing', 'completed')),
  new_status text not null
    check (new_status in ('pending', 'reviewing', 'completed')),
  admin_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists property_request_status_audit_request_idx
  on public.property_request_status_audit_log (request_id, created_at desc);

alter table public.property_request_status_audit_log enable row level security;
alter table public.property_request_status_audit_log force row level security;

revoke all on table public.property_request_status_audit_log from anon, authenticated;
grant select on table public.property_request_status_audit_log to authenticated;
grant all on table public.property_request_status_audit_log to service_role;

drop policy if exists "Team admins read request status audit"
  on public.property_request_status_audit_log;
create policy "Team admins read request status audit"
on public.property_request_status_audit_log for select
to authenticated
using ((select private.is_team_admin()));

create or replace function private.protect_request_status_audit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- The protected server deletion route must still be able to remove an entire
  -- customer request and its cascaded history. Browser roles never receive
  -- delete permission on this table.
  if tg_op = 'DELETE' and current_user = 'service_role' then
    return old;
  end if;

  raise exception 'Request status audit entries are immutable';
end;
$$;

revoke all on function private.protect_request_status_audit() from public, anon, authenticated;

drop trigger if exists protect_request_status_audit
  on public.property_request_status_audit_log;
create trigger protect_request_status_audit
before update or delete on public.property_request_status_audit_log
for each row execute function private.protect_request_status_audit();

create or replace function public.update_property_request_status(
  p_request_id uuid,
  p_new_status text,
  p_admin_user_id uuid
)
returns setof public.property_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous_request public.property_requests%rowtype;
  updated_request public.property_requests%rowtype;
begin
  if p_new_status not in ('pending', 'reviewing', 'completed') then
    raise exception 'Invalid request status';
  end if;

  if not exists (
    select 1
    from public.admin_users
    where user_id = p_admin_user_id
      and active = true
      and role = 'admin'
  ) then
    raise exception 'Admin is not authorized';
  end if;

  select *
  into previous_request
  from public.property_requests
  where id = p_request_id
  for update;

  if not found then
    return;
  end if;

  if previous_request.status = p_new_status then
    return next previous_request;
    return;
  end if;

  update public.property_requests
  set status = p_new_status
  where id = p_request_id
  returning * into updated_request;

  insert into public.property_request_status_audit_log (
    request_id,
    previous_status,
    new_status,
    admin_user_id
  )
  values (
    p_request_id,
    previous_request.status,
    p_new_status,
    p_admin_user_id
  );

  return next updated_request;
end;
$$;

revoke all on function public.update_property_request_status(uuid, text, uuid)
  from public, anon, authenticated;
grant execute on function public.update_property_request_status(uuid, text, uuid)
  to service_role;

-- Status changes are now server-owned so that every mutation is auditable.
revoke update on table public.property_requests from authenticated;

comment on table public.property_request_status_audit_log is
  'Immutable history of administrator-owned property request status changes.';

commit;
