begin;

-- Harden document-analysis history, atomic review logging and immutable audit records.
-- Run this migration only once in the Supabase SQL Editor.
-- Do not rerun the full supabase-schema.sql.

alter table public.document_analysis_runs
  add column if not exists is_current boolean not null default false,
  add column if not exists superseded_at timestamptz,
  add column if not exists superseded_by_run_id uuid
    references public.document_analysis_runs(id) on delete set null;

alter table public.document_analysis_runs
  alter column is_current set default false;

alter table public.document_analysis_runs
  drop constraint if exists document_analysis_runs_status_check;

alter table public.document_analysis_runs
  add constraint document_analysis_runs_status_check
  check (status in ('running', 'completed', 'failed', 'superseded'));

-- Remove a previous broad uniqueness constraint if it exists.
do $$
declare
  constraint_name text;
begin
  select con.conname
    into constraint_name
  from pg_constraint con
  where con.conrelid = 'public.document_analysis_runs'::regclass
    and con.contype = 'u'
    and pg_get_constraintdef(con.oid)
      ilike '%request_id%document_path%prompt_version%schema_version%'
  limit 1;

  if constraint_name is not null then
    execute format(
      'alter table public.document_analysis_runs drop constraint %I',
      constraint_name
    );
  end if;
end
$$;

-- Backfill existing history safely before creating the partial unique index.
-- Prefer the newest completed run. If no completed run exists, use the newest run.
with ranked_runs as (
  select
    id,
    row_number() over (
      partition by request_id, document_path, prompt_version, schema_version
      order by
        case when status = 'completed' then 0 else 1 end,
        created_at desc,
        id desc
    ) as row_position,
    first_value(id) over (
      partition by request_id, document_path, prompt_version, schema_version
      order by
        case when status = 'completed' then 0 else 1 end,
        created_at desc,
        id desc
    ) as current_run_id
  from public.document_analysis_runs
)
update public.document_analysis_runs runs
set
  is_current = (ranked.row_position = 1),
  status = case
    when ranked.row_position = 1 then runs.status
    when runs.status in ('running', 'completed') then 'superseded'
    else runs.status
  end,
  superseded_at = case
    when ranked.row_position = 1 then null
    else coalesce(runs.superseded_at, now())
  end,
  superseded_by_run_id = case
    when ranked.row_position = 1 then null
    else ranked.current_run_id
  end,
  updated_at = now()
from ranked_runs ranked
where runs.id = ranked.id;

drop index if exists public.document_analysis_runs_current_version_idx;

create unique index document_analysis_runs_current_version_idx
  on public.document_analysis_runs (
    request_id,
    document_path,
    prompt_version,
    schema_version
  )
  where is_current;

-- Audit records and calculation snapshots may not be changed after insertion.
-- DELETE remains allowed so a complete customer-request deletion can cascade
-- for GDPR and retention workflows.
create or replace function public.prevent_immutable_record_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% is immutable and cannot be updated', tg_table_name
    using errcode = '55000';
end;
$$;

revoke all on function public.prevent_immutable_record_update()
  from public, anon, authenticated;
grant execute on function public.prevent_immutable_record_update()
  to service_role;

drop trigger if exists protect_document_fact_audit_log
  on public.document_fact_audit_log;

create trigger protect_document_fact_audit_log
before update on public.document_fact_audit_log
for each row
execute function public.prevent_immutable_record_update();

drop trigger if exists protect_rnd_calculation_snapshots
  on public.rnd_calculation_snapshots;

create trigger protect_rnd_calculation_snapshots
before update on public.rnd_calculation_snapshots
for each row
execute function public.prevent_immutable_record_update();

-- Review a document fact and write its audit entry atomically.
create or replace function public.review_document_fact(
  p_fact_id uuid,
  p_review_status text,
  p_reviewed_value jsonb,
  p_admin_user_id uuid
)
returns setof public.document_facts
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous_fact public.document_facts%rowtype;
  updated_fact public.document_facts%rowtype;
begin
  if p_admin_user_id is null then
    raise exception 'Admin user is required'
      using errcode = '22023';
  end if;

  if p_review_status not in ('accepted', 'edited', 'rejected') then
    raise exception 'Invalid review status'
      using errcode = '22023';
  end if;

  if p_review_status in ('accepted', 'edited')
     and (
       p_reviewed_value is null
       or p_reviewed_value = 'null'::jsonb
     ) then
    raise exception 'A reviewed value is required for accepted or edited facts'
      using errcode = '22023';
  end if;

  if p_review_status = 'rejected'
     and p_reviewed_value is not null
     and p_reviewed_value <> 'null'::jsonb then
    raise exception 'Rejected facts must not contain a reviewed value'
      using errcode = '22023';
  end if;

  select facts.*
    into previous_fact
  from public.document_facts facts
  join public.document_analysis_runs runs
    on runs.id = facts.analysis_run_id
  where facts.id = p_fact_id
    and runs.status = 'completed'
    and runs.is_current
  for update of facts;

  if not found then
    raise exception 'Current document fact not found'
      using errcode = 'P0002';
  end if;

  update public.document_facts
  set
    review_status = p_review_status,
    reviewed_value = case
      when p_review_status = 'rejected' then null
      else p_reviewed_value
    end,
    reviewed_by = p_admin_user_id,
    reviewed_at = now(),
    updated_at = now()
  where id = p_fact_id
  returning * into updated_fact;

  insert into public.document_fact_audit_log (
    fact_id,
    request_id,
    action,
    previous_status,
    new_status,
    previous_value,
    new_value,
    admin_user_id
  )
  values (
    previous_fact.id,
    previous_fact.request_id,
    p_review_status,
    previous_fact.review_status,
    p_review_status,
    coalesce(previous_fact.reviewed_value, previous_fact.normalized_value),
    case
      when p_review_status = 'rejected' then null
      else p_reviewed_value
    end,
    p_admin_user_id
  );

  return next updated_fact;
end;
$$;

-- Complete a new analysis run and supersede the previous current run.
-- The advisory lock prevents concurrent runs for the same document/version
-- from becoming current at the same time.
create or replace function public.complete_document_analysis_run(
  p_run_id uuid
)
returns setof public.document_analysis_runs
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_run public.document_analysis_runs%rowtype;
  completed_run public.document_analysis_runs%rowtype;
  lock_key text;
begin
  select *
    into target_run
  from public.document_analysis_runs
  where id = p_run_id
  for update;

  if not found
     or target_run.status <> 'running'
     or target_run.is_current then
    raise exception 'Analysis run cannot be completed'
      using errcode = '55000';
  end if;

  lock_key :=
    target_run.request_id::text || ':' ||
    target_run.document_path || ':' ||
    target_run.prompt_version || ':' ||
    target_run.schema_version;

  perform pg_advisory_xact_lock(hashtext(lock_key));

  update public.document_analysis_runs
  set
    status = 'superseded',
    is_current = false,
    superseded_at = now(),
    superseded_by_run_id = target_run.id,
    updated_at = now()
  where request_id = target_run.request_id
    and document_path = target_run.document_path
    and prompt_version = target_run.prompt_version
    and schema_version = target_run.schema_version
    and is_current
    and id <> target_run.id;

  update public.document_analysis_runs
  set
    status = 'completed',
    is_current = true,
    superseded_at = null,
    superseded_by_run_id = null,
    updated_at = now()
  where id = target_run.id
  returning * into completed_run;

  return next completed_run;
end;
$$;

revoke all on function public.review_document_fact(uuid, text, jsonb, uuid)
  from public, anon, authenticated;
grant execute on function public.review_document_fact(uuid, text, jsonb, uuid)
  to service_role;

revoke all on function public.complete_document_analysis_run(uuid)
  from public, anon, authenticated;
grant execute on function public.complete_document_analysis_run(uuid)
  to service_role;

commit;
