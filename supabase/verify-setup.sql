-- Safe read-only checks after base schema, workflow migration and add-admin.sql.

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
      'report_drafts'
    )
  )
   or (schemaname = 'storage' and tablename = 'objects' and policyname like 'Team admins%')
order by schemaname, tablename, policyname;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'documents';

select email, role, active, created_at
from public.admin_users
order by created_at;
