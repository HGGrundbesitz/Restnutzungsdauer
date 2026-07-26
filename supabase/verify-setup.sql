-- Read-only verification after the canonical schema and migrations.
-- Expected order:
--   1. supabase-schema.sql
--   2. 20260712180000_document_review_workflow.sql
--   3. 20260713120000_harden_document_review_history.sql
--   4. 20260725150000_add_document_fact_metadata.sql
--   5. 20260726120000_request_status_audit.sql
--   6. supabase/add-admin.sql (separate, environment-specific bootstrap)

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'property_requests',
    'admin_users',
    'rnd_estimates',
    'document_analysis_runs',
    'document_facts',
    'document_conflicts',
    'document_fact_audit_log',
    'rnd_calculation_snapshots',
    'property_request_status_audit_log',
    'report_drafts'
  )
order by tablename;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where (
    schemaname = 'public'
    and tablename in (
      'property_requests',
      'admin_users',
      'rnd_estimates',
      'document_analysis_runs',
      'document_facts',
      'document_conflicts',
      'document_fact_audit_log',
      'rnd_calculation_snapshots',
      'property_request_status_audit_log',
      'report_drafts'
    )
  )
   or (schemaname = 'storage' and tablename = 'objects' and policyname like 'Team admins%')
order by schemaname, tablename, policyname;

select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'document_facts' and column_name = 'fact_metadata')
    or (
      table_name = 'document_analysis_runs'
      and column_name in ('is_current', 'superseded_at', 'superseded_by_run_id')
    )
  )
order by table_name, ordinal_position;

select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and indexname = 'document_analysis_runs_current_version_idx';

select routine_schema, routine_name, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'review_document_fact',
    'complete_document_analysis_run',
    'prevent_immutable_record_update',
    'update_property_request_status'
  )
order by routine_name;

select
  event_object_table as table_name,
  trigger_name,
  action_timing,
  event_manipulation
from information_schema.triggers
where trigger_schema = 'public'
  and trigger_name in (
    'protect_document_fact_audit_log',
    'protect_rnd_calculation_snapshots',
    'protect_request_status_audit'
  )
order by table_name, trigger_name;

select
  request_id,
  document_path,
  prompt_version,
  schema_version,
  count(*) as current_count
from public.document_analysis_runs
where is_current = true
group by request_id, document_path, prompt_version, schema_version
having count(*) > 1;

select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and indexname = 'property_request_status_audit_request_idx';

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'documents';

select email, role, active, created_at
from public.admin_users
order by created_at;
