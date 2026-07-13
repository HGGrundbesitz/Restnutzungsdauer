import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import {detectDocumentConflicts, type FormFactSource} from './conflicts.ts';
import type {DocumentConflictRecord, DocumentFactRecord, NormalizedFactValue} from './types.ts';

export async function refreshRequestConflicts(supabase: SupabaseClient, requestId: string) {
  const {data: currentRuns, error: runsError} = await supabase
    .from('document_analysis_runs')
    .select('id')
    .eq('request_id', requestId)
    .eq('status', 'completed')
    .eq('is_current', true);
  if (runsError) {
    throw new Error('Die aktuellen Dokumentprüfungen konnten nicht geladen werden.');
  }

  const currentRunIds = (currentRuns ?? []).map((run) => run.id);
  const {data: facts, error: factsError} = currentRunIds.length > 0
    ? await supabase
        .from('document_facts')
        .select('id, field_key, normalized_value, reviewed_value, review_status, file_name, page_number, fact_metadata')
        .in('analysis_run_id', currentRunIds)
    : {data: [], error: null};

  const [{data: requestRow, error: requestError}, {data: estimate, error: estimateError}] =
    await Promise.all([
      supabase.from('property_requests').select('address, year').eq('id', requestId).maybeSingle(),
      supabase
        .from('rnd_estimates')
        .select('stichtag, building_type_code, construction_year, raw_answers')
        .eq('request_id', requestId)
        .maybeSingle(),
    ]);

  if (factsError || requestError || estimateError) {
    throw new Error('Die Widersprüche konnten nicht aktualisiert werden.');
  }

  const formSources = buildFormSources(requestRow, estimate);
  const detected = detectDocumentConflicts((facts ?? []) as DocumentFactRecord[], formSources);
  const {data: existing, error: existingError} = await supabase
    .from('document_conflicts')
    .select('*')
    .eq('request_id', requestId);

  if (existingError) {
    throw new Error('Bestehende Widersprüche konnten nicht geladen werden.');
  }

  const existingByField = new Map(
    ((existing ?? []) as DocumentConflictRecord[]).map((conflict) => [conflict.field_key, conflict]),
  );
  const detectedFields = new Set(detected.map((conflict) => conflict.fieldKey));

  for (const conflict of detected) {
    const previous = existingByField.get(conflict.fieldKey);
    const sourcesChanged = previous
      ? sourceSignature(previous.source_values) !== sourceSignature(conflict.sources)
      : true;
    const keepResolution = previous && !sourcesChanged && previous.resolution_status !== 'open';

    const payload = {
      request_id: requestId,
      field_key: conflict.fieldKey,
      fact_ids: conflict.factIds,
      source_values: conflict.sources,
      conflict_summary: conflict.summary,
      resolution_status: keepResolution ? previous.resolution_status : 'open',
      resolved_value: keepResolution ? previous.resolved_value : null,
      resolved_by: keepResolution ? previous.resolved_by : null,
      resolved_at: keepResolution ? previous.resolved_at : null,
      updated_at: new Date().toISOString(),
    };

    const {error} = await supabase
      .from('document_conflicts')
      .upsert(payload, {onConflict: 'request_id,field_key'});
    if (error) throw new Error('Ein Widerspruch konnte nicht gespeichert werden.');
  }

  const staleIds = ((existing ?? []) as DocumentConflictRecord[])
    .filter((conflict) => !detectedFields.has(conflict.field_key))
    .map((conflict) => conflict.id);
  if (staleIds.length > 0) {
    const {error} = await supabase.from('document_conflicts').delete().in('id', staleIds);
    if (error) throw new Error('Veraltete Widersprüche konnten nicht entfernt werden.');
  }
}

function buildFormSources(
  requestRow: {address?: string | null; year?: number | null} | null,
  estimate: {
    stichtag?: string | null;
    building_type_code?: string | null;
    construction_year?: number | null;
    raw_answers?: unknown;
  } | null,
): FormFactSource[] {
  const sources: FormFactSource[] = [];

  if (requestRow?.address && requestRow.address !== 'Nicht angegeben') {
    sources.push({fieldKey: 'property_address', value: requestRow.address, label: 'Angabe im Formular'});
  }
  const constructionYear = estimate?.construction_year ?? requestRow?.year;
  if (typeof constructionYear === 'number') {
    sources.push({fieldKey: 'construction_year', value: constructionYear, label: 'Angabe im Formular'});
  }
  if (estimate?.stichtag) {
    sources.push({fieldKey: 'reference_date', value: estimate.stichtag, label: 'Angabe im Formular'});
  }
  if (estimate?.building_type_code) {
    sources.push({fieldKey: 'building_type', value: estimate.building_type_code, label: 'Angabe im Formular'});
  }

  const rawAnswers = asRecord(estimate?.raw_answers);
  const property = asRecord(rawAnswers?.property);
  const area = asFiniteNumber(property?.area);
  const units = asFiniteNumber(property?.units);
  if (area !== null) {
    sources.push({fieldKey: 'living_area', value: area, label: 'Formular: Wohn-/Nutzfläche'});
  }
  if (units !== null) {
    sources.push({fieldKey: 'number_of_units', value: units, label: 'Angabe im Formular'});
  }

  return sources;
}

function sourceSignature(sources: Array<{kind: string; id: string; value: NormalizedFactValue}>) {
  return JSON.stringify(
    sources
      .map((source) => ({kind: source.kind, id: source.id, value: source.value}))
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
