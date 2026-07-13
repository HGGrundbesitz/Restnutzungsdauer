begin;

alter table public.document_analysis_runs
  add column if not exists is_current boolean not null default true,
  add column if not exists superseded_at timestamptz,
  add column if not exists superseded_by_run_id uuid references public.document_analysis_runs(id) on delete set null;

alter table public.document_analysis_runs
  drop constraint if exists document_analysis_runs_status_check;

alter table public.document_analysis_runs
  add constraint document_analysis_runs_status_check
  check (status in ('running', 'completed', 'failed', 'superseded'));

do $$
declare
  constraint_name text;
begin
  select con.conname
  into constraint_name
  from pg_constraint con
  where con.conrelid = 'public.document_analysis_runs'::regclass
    and con.contype = 'u'
    and pg_get_constraintdef(con.oid) ilike '%request_id%document_path%prompt_version%schema_version%'
  limit 1;

  if constraint_name is not null then
    execute format('alter table public.document_analysis_runs drop constraint %I', constraint_name);
  end if;
end
$$;

create unique index if not exists document_analysis_runs_current_version_idx
  on public.document_analysis_runs (request_id, document_path, prompt_version, schema_version)
  where is_current;

create or replace function public.prevent_immutable_record_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% is immutable', tg_table_name using errcode = '55000';
end;
$$;

revoke all on function public.prevent_immutable_record_change() from public, anon, authenticated;
grant execute on function public.prevent_immutable_record_change() to service_role;

drop trigger if exists protect_document_fact_audit_log on public.document_fact_audit_log;
create trigger protect_document_fact_audit_log
before update or delete on public.document_fact_audit_log
for each row execute function public.prevent_immutable_record_change();

drop trigger if exists protect_rnd_calculation_snapshots on public.rnd_calculation_snapshots;
create trigger protect_rnd_calculation_snapshots
before update or delete on public.rnd_calculation_snapshots
for each row execute function public.prevent_immutable_record_change();

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
    raise exception 'Admin user is required' using errcode = '22023';
  end if;

  if p_review_status not in ('accepted', 'edited', 'rejected') then
    raise exception 'Invalid review status' using errcode = '22023';
  end if;

  select facts.*
  into previous_fact
  from public.document_facts facts
  join public.document_analysis_runs runs on runs.id = facts.analysis_run_id
  where facts.id = p_fact_id
    and runs.status = 'completed'
    and runs.is_current
  for update of facts;

  if not found then
    raise exception 'Current document fact not found' using errcode = 'P0002';
  end if;

  update public.document_facts
  set review_status = p_review_status,
      reviewed_value = p_reviewed_value,
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
  ) values (
    previous_fact.id,
    previous_fact.request_id,
    p_review_status,
    previous_fact.review_status,
    p_review_status,
    coalesce(previous_fact.reviewed_value, previous_fact.normalized_value),
    p_reviewed_value,
    p_admin_user_id
  );

  return next updated_fact;
end;
$$;

create or replace function public.complete_document_analysis_run(p_run_id uuid)
returns setof public.document_analysis_runs
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_run public.document_analysis_runs%rowtype;
  completed_run public.document_analysis_runs%rowtype;
begin
  select * into target_run
  from public.document_analysis_runs
  where id = p_run_id
  for update;

  if not found or target_run.status <> 'running' or target_run.is_current then
    raise exception 'Analysis run cannot be completed' using errcode = '55000';
  end if;

  update public.document_analysis_runs
  set status = 'superseded',
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
  set status = 'completed',
      is_current = true,
      updated_at = now()
  where id = target_run.id
  returning * into completed_run;

  return next completed_run;
end;
$$;

revoke all on function public.review_document_fact(uuid, text, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.review_document_fact(uuid, text, jsonb, uuid) to service_role;

revoke all on function public.complete_document_analysis_run(uuid) from public, anon, authenticated;
grant execute on function public.complete_document_analysis_run(uuid) to service_role;

commit;
