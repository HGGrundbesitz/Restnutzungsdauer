-- Add structured extraction context after the document workflow exists.

begin;

alter table public.document_facts
  add column if not exists fact_metadata jsonb not null default '{}'::jsonb;

alter table public.document_facts
  drop constraint if exists document_facts_fact_metadata_object_check;

alter table public.document_facts
  add constraint document_facts_fact_metadata_object_check
  check (jsonb_typeof(fact_metadata) = 'object');

comment on column public.document_facts.fact_metadata is
  'Structured extraction context such as year range, scope, evidence quality and proof status.';

commit;
