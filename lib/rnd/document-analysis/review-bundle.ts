import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {
  DocumentAnalysisRunRecord,
  DocumentConflictRecord,
  DocumentFactRecord,
  ReviewBundle,
} from './types.ts';

export async function loadReviewBundle(supabase: SupabaseClient, requestId: string): Promise<ReviewBundle> {
  const {data: runs, error: runsError} = await supabase
    .from('document_analysis_runs')
    .select('id, request_id, document_path, file_name, model, prompt_version, schema_version, status, is_current, superseded_at, superseded_by_run_id, document_summary, error_message, created_at, updated_at')
    .eq('request_id', requestId)
    .order('created_at', {ascending: true});

  if (runsError) {
    throw new Error('Die Dokumentprüfung konnte nicht geladen werden.');
  }

  const typedRuns = (runs ?? []) as DocumentAnalysisRunRecord[];
  const currentRunIds = typedRuns
    .filter((run) => run.is_current && run.status === 'completed')
    .map((run) => run.id);
  const factsQuery = currentRunIds.length > 0
    ? supabase
        .from('document_facts')
        .select('*')
        .in('analysis_run_id', currentRunIds)
        .order('file_name', {ascending: true})
        .order('page_number', {ascending: true})
    : null;

  const [{data: facts, error: factsError}, {data: conflicts, error: conflictsError}] =
    await Promise.all([
      factsQuery ?? Promise.resolve({data: [], error: null}),
      supabase
        .from('document_conflicts')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', {ascending: true}),
    ]);

  if (factsError || conflictsError) {
    throw new Error('Die Dokumentprüfung konnte nicht geladen werden.');
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
    signedDocumentUrls,
  };
}
