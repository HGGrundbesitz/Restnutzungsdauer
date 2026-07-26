import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {
  DocumentAnalysisRunRecord,
  DocumentConflictRecord,
  DocumentFactAuditRecord,
  DocumentFactRecord,
  RequestStatusAuditRecord,
  ReviewBundle,
  RndCalculationSnapshotRecord,
} from './types.ts';

export async function loadReviewBundle(supabase: SupabaseClient, requestId: string): Promise<ReviewBundle> {
  const {data: runs, error: runsError} = await supabase
    .from('document_analysis_runs')
    .select(
      'id, request_id, document_path, file_name, model, prompt_version, schema_version, status, is_current, superseded_at, superseded_by_run_id, document_summary, error_message, created_at, updated_at',
    )
    .eq('request_id', requestId)
    .order('created_at', {ascending: true});

  if (runsError) {
    throw new Error('Die Dokumentprüfung konnte nicht geladen werden.');
  }

  const typedRuns = (runs ?? []) as DocumentAnalysisRunRecord[];
  const currentRunIds = typedRuns
    .filter((run) => run.is_current && run.status === 'completed')
    .map((run) => run.id);
  const factsQuery =
    currentRunIds.length > 0
      ? supabase
          .from('document_facts')
          .select('*')
          .in('analysis_run_id', currentRunIds)
          .order('file_name', {ascending: true})
          .order('page_number', {ascending: true})
      : null;

  const [
    {data: facts, error: factsError},
    {data: conflicts, error: conflictsError},
    {data: factAudits, error: factAuditsError},
    {data: calculationSnapshots, error: calculationSnapshotsError},
    statusEventsResult,
  ] = await Promise.all([
    factsQuery ?? Promise.resolve({data: [], error: null}),
    supabase
      .from('document_conflicts')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', {ascending: true}),
    supabase
      .from('document_fact_audit_log')
      .select(
        'id, request_id, fact_id, action, previous_status, previous_value, new_status, new_value, admin_user_id, created_at, fact:document_facts(field_key, file_name, page_number)',
      )
      .eq('request_id', requestId)
      .order('created_at', {ascending: true}),
    supabase
      .from('rnd_calculation_snapshots')
      .select(
        'id, request_id, source_fact_ids, result_snapshot, calculator_model_version, warnings, approved_by, created_at',
      )
      .eq('request_id', requestId)
      .order('created_at', {ascending: true}),
    supabase
      .from('property_request_status_audit_log')
      .select('id, request_id, previous_status, new_status, admin_user_id, created_at')
      .eq('request_id', requestId)
      .order('created_at', {ascending: true}),
  ]);

  if (factsError || conflictsError || factAuditsError || calculationSnapshotsError) {
    throw new Error('Die Dokumentprüfung konnte nicht geladen werden.');
  }

  const statusEventsError = statusEventsResult.error;
  const statusEventsUnavailable =
    statusEventsError?.code === '42P01' ||
    statusEventsError?.code === 'PGRST205' ||
    statusEventsError?.message?.includes('property_request_status_audit_log');
  if (statusEventsError && !statusEventsUnavailable) {
    throw new Error('Der Anfrageverlauf konnte nicht geladen werden.');
  }

  const typedFactAudits = (factAudits ?? []) as unknown as DocumentFactAuditRecord[];
  const typedCalculationSnapshots = (calculationSnapshots ?? []) as RndCalculationSnapshotRecord[];
  const typedStatusEvents = (
    statusEventsUnavailable ? [] : statusEventsResult.data ?? []
  ) as RequestStatusAuditRecord[];

  const reviewerIds = Array.from(
    new Set(
      [
        ...typedFactAudits.map((entry) => entry.admin_user_id),
        ...typedCalculationSnapshots.map((entry) => entry.approved_by),
        ...typedStatusEvents.map((entry) => entry.admin_user_id),
      ].filter((value): value is string => Boolean(value)),
    ),
  );
  const reviewerLabels: Record<string, string> = {};
  if (reviewerIds.length > 0) {
    const {data: reviewers} = await supabase
      .from('admin_users')
      .select('user_id, email, display_name')
      .in('user_id', reviewerIds);
    for (const reviewer of reviewers ?? []) {
      reviewerLabels[reviewer.user_id] = reviewer.display_name || reviewer.email || 'Administrator';
    }
  }

  const paths = Array.from(new Set(typedRuns.map((run) => run.document_path)));
  const signedDocumentUrls: Record<string, string> = {};
  await Promise.all(
    paths.map(async (path) => {
      const {data, error} = await supabase.storage.from('documents').createSignedUrl(path, 300);
      if (!error && data?.signedUrl) signedDocumentUrls[path] = data.signedUrl;
    }),
  );

  return {
    runs: typedRuns,
    facts: (facts ?? []) as DocumentFactRecord[],
    conflicts: (conflicts ?? []) as DocumentConflictRecord[],
    factAudits: typedFactAudits,
    calculationSnapshots: typedCalculationSnapshots,
    statusEvents: typedStatusEvents,
    reviewerLabels,
    signedDocumentUrls,
  };
}
