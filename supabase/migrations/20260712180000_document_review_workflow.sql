-- Structured document extraction and expert-review workflow.
-- Apply after the base RND schema.

begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

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

revoke all on function private.is_team_admin() from public, anon, authenticated;
grant execute on function private.is_team_admin() to authenticated;

create table if not exists public.document_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.property_requests(id) on delete cascade,
  document_path text not null check (char_length(document_path) between 1 and 500),
  file_name text not null check (char_length(file_name) between 1 and 240),
  model text not null check (char_length(model) between 1 and 120),
  prompt_version text not null check (char_length(prompt_version) between 1 and 120),
  schema_version text not null check (char_length(schema_version) between 1 and 120),
  status text not null check (status in ('running', 'completed', 'failed')),
  document_summary text check (document_summary is null or char_length(document_summary) <= 1000),
  raw_response jsonb,
  error_message text check (error_message is null or char_length(error_message) <= 1000),
  requested_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, document_path, prompt_version, schema_version)
);

create table if not exists public.document_facts (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.property_requests(id) on delete cascade,
  analysis_run_id uuid not null references public.document_analysis_runs(id) on delete cascade,
  document_path text not null check (char_length(document_path) between 1 and 500),
  file_name text not null check (char_length(file_name) between 1 and 240),
  field_key text not null check (char_length(field_key) between 1 and 120),
  normalized_value jsonb not null,
  original_value text not null check (char_length(original_value) between 1 and 2000),
  page_number integer not null check (page_number between 1 and 10000),
  evidence_text text not null check (char_length(evidence_text) between 1 and 2000),
  confidence numeric(4, 3) not null check (confidence between 0 and 1),
  extraction_notes text not null default '' check (char_length(extraction_notes) <= 1000),
  review_status text not null default 'pending_review'
    check (review_status in ('pending_review', 'accepted', 'edited', 'rejected')),
  reviewed_value jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_conflicts (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.property_requests(id) on delete cascade,
  field_key text not null check (char_length(field_key) between 1 and 120),
  fact_ids uuid[] not null default '{}'::uuid[],
  source_values jsonb not null default '[]'::jsonb check (jsonb_typeof(source_values) = 'array'),
  conflict_summary text not null check (char_length(conflict_summary) between 1 and 1000),
  resolution_status text not null default 'open'
    check (resolution_status in ('open', 'resolved', 'acknowledged')),
  resolved_value jsonb,
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, field_key)
);

create table if not exists public.document_fact_audit_log (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.property_requests(id) on delete cascade,
  fact_id uuid references public.document_facts(id) on delete set null,
  action text not null check (action in ('accepted', 'edited', 'rejected')),
  previous_status text,
  previous_value jsonb,
  new_status text not null,
  new_value jsonb,
  admin_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.rnd_calculation_snapshots (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.property_requests(id) on delete cascade,
  source_fact_ids uuid[] not null default '{}'::uuid[],
  original_input jsonb not null check (jsonb_typeof(original_input) = 'object'),
  approved_input jsonb not null check (jsonb_typeof(approved_input) = 'object'),
  property_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(property_snapshot) = 'object'),
  result_snapshot jsonb not null check (jsonb_typeof(result_snapshot) = 'object'),
  calculator_model_version text not null check (char_length(calculator_model_version) between 1 and 120),
  warnings jsonb not null default '[]'::jsonb check (jsonb_typeof(warnings) = 'array'),
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.report_drafts (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.property_requests(id) on delete cascade,
  version integer not null check (version > 0),
  status text not null default 'draft'
    check (status in ('draft', 'in_review', 'approved', 'rejected')),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  model text,
  prompt_version text,
  generated_pdf_path text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, version)
);

create index if not exists document_analysis_runs_request_idx
  on public.document_analysis_runs (request_id, created_at desc);
create index if not exists document_analysis_runs_status_idx
  on public.document_analysis_runs (status, updated_at desc);
create index if not exists document_facts_request_review_idx
  on public.document_facts (request_id, review_status, field_key);
create index if not exists document_facts_document_idx
  on public.document_facts (request_id, document_path, page_number);
create unique index if not exists document_facts_evidence_unique_idx
  on public.document_facts (analysis_run_id, field_key, page_number, md5(evidence_text));
create index if not exists document_conflicts_request_status_idx
  on public.document_conflicts (request_id, resolution_status);
create index if not exists document_fact_audit_request_idx
  on public.document_fact_audit_log (request_id, created_at desc);
create index if not exists rnd_calculation_snapshots_request_idx
  on public.rnd_calculation_snapshots (request_id, created_at desc);
create index if not exists report_drafts_request_status_idx
  on public.report_drafts (request_id, status, version desc);

alter table public.document_analysis_runs enable row level security;
alter table public.document_analysis_runs force row level security;
alter table public.document_facts enable row level security;
alter table public.document_facts force row level security;
alter table public.document_conflicts enable row level security;
alter table public.document_conflicts force row level security;
alter table public.document_fact_audit_log enable row level security;
alter table public.document_fact_audit_log force row level security;
alter table public.rnd_calculation_snapshots enable row level security;
alter table public.rnd_calculation_snapshots force row level security;
alter table public.report_drafts enable row level security;
alter table public.report_drafts force row level security;

revoke all on table public.document_analysis_runs from anon, authenticated;
revoke all on table public.document_facts from anon, authenticated;
revoke all on table public.document_conflicts from anon, authenticated;
revoke all on table public.document_fact_audit_log from anon, authenticated;
revoke all on table public.rnd_calculation_snapshots from anon, authenticated;
revoke all on table public.report_drafts from anon, authenticated;

grant select on table public.document_analysis_runs to authenticated;
grant select on table public.document_facts to authenticated;
grant select on table public.document_conflicts to authenticated;
grant select on table public.document_fact_audit_log to authenticated;
grant select on table public.rnd_calculation_snapshots to authenticated;
grant select on table public.report_drafts to authenticated;

grant all on table public.document_analysis_runs to service_role;
grant all on table public.document_facts to service_role;
grant all on table public.document_conflicts to service_role;
grant all on table public.document_fact_audit_log to service_role;
grant all on table public.rnd_calculation_snapshots to service_role;
grant all on table public.report_drafts to service_role;

drop policy if exists "Team admins manage document analysis runs" on public.document_analysis_runs;
drop policy if exists "Team admins read document analysis runs" on public.document_analysis_runs;
create policy "Team admins read document analysis runs"
on public.document_analysis_runs for select to authenticated
using ((select private.is_team_admin()));

drop policy if exists "Team admins manage document facts" on public.document_facts;
drop policy if exists "Team admins read document facts" on public.document_facts;
create policy "Team admins read document facts"
on public.document_facts for select to authenticated
using ((select private.is_team_admin()));

drop policy if exists "Team admins manage document conflicts" on public.document_conflicts;
drop policy if exists "Team admins read document conflicts" on public.document_conflicts;
create policy "Team admins read document conflicts"
on public.document_conflicts for select to authenticated
using ((select private.is_team_admin()));

drop policy if exists "Team admins read document fact audit" on public.document_fact_audit_log;
create policy "Team admins read document fact audit"
on public.document_fact_audit_log for select to authenticated
using ((select private.is_team_admin()));

drop policy if exists "Team admins read calculation snapshots" on public.rnd_calculation_snapshots;
create policy "Team admins read calculation snapshots"
on public.rnd_calculation_snapshots for select to authenticated
using ((select private.is_team_admin()));

drop policy if exists "Team admins manage report drafts" on public.report_drafts;
drop policy if exists "Team admins read report drafts" on public.report_drafts;
create policy "Team admins read report drafts"
on public.report_drafts for select to authenticated
using ((select private.is_team_admin()));

comment on table public.document_analysis_runs is 'Versioned, idempotent AI extraction executions for private request documents.';
comment on table public.document_facts is 'Document facts with page evidence. No fact is accepted automatically.';
comment on table public.document_conflicts is 'Deterministically detected differences between documents and form data.';
comment on table public.rnd_calculation_snapshots is 'Immutable deterministic calculator runs approved by an admin.';
comment on table public.report_drafts is 'Reserved for later expert-reviewed report drafts; never a signed final report.';

commit;
