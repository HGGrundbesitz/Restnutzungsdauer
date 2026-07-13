alter table public.request_document_facts
  add column if not exists fact_metadata jsonb not null default '{}'::jsonb;

comment on column public.request_document_facts.fact_metadata is
  'Structured extraction context such as year range, scope, evidence quality and proof status.';
