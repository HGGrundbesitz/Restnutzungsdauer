import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import {extractDocumentFacts, DEFAULT_DOCUMENT_ANALYSIS_MODEL} from './openai-extraction.ts';
import {DOCUMENT_EXTRACTION_PROMPT_VERSION} from './prompt.ts';
import {DOCUMENT_EXTRACTION_SCHEMA_VERSION} from './schema.ts';
import {hasPdfMagicBytes, isAllowedDocumentPath, MAX_PDF_SIZE, safePdfName} from './paths.ts';
import {refreshRequestConflicts} from './repository.ts';

type AnalyzeRequestDocumentsOptions = {
  supabase: SupabaseClient;
  requestId: string;
  requestedBy: string;
  apiKey: string;
  model?: string;
  documentPath?: string;
  force?: boolean;
};

export type DocumentAnalysisItemResult = {
  documentPath: string;
  status: 'completed' | 'cached' | 'failed';
  factCount: number;
  error?: string;
};

export class DocumentAnalysisRequestError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404,
  ) {
    super(message);
  }
}

export async function analyzeRequestDocuments({
  supabase,
  requestId,
  requestedBy,
  apiKey,
  model = DEFAULT_DOCUMENT_ANALYSIS_MODEL,
  documentPath,
  force = false,
}: AnalyzeRequestDocumentsOptions): Promise<DocumentAnalysisItemResult[]> {
  const {data: requestRow, error: requestError} = await supabase
    .from('property_requests')
    .select('id, documents')
    .eq('id', requestId)
    .maybeSingle();

  if (requestError || !requestRow) {
    throw new DocumentAnalysisRequestError('Die Anfrage wurde nicht gefunden.', 404);
  }

  const attachedPaths = Array.isArray(requestRow.documents)
    ? requestRow.documents.filter((path): path is string => typeof path === 'string')
    : [];
  const selectedPaths = documentPath ? [documentPath] : attachedPaths;

  if (selectedPaths.length === 0) {
    throw new DocumentAnalysisRequestError('Zu dieser Anfrage wurden keine PDF-Dokumente hochgeladen.', 400);
  }
  if (
    selectedPaths.some(
      (path) => !isAllowedDocumentPath(path) || !attachedPaths.includes(path),
    )
  ) {
    throw new DocumentAnalysisRequestError('Mindestens ein ausgewähltes Dokument ist ungültig.', 400);
  }

  const results: DocumentAnalysisItemResult[] = [];
  for (const path of selectedPaths) {
    results.push(
      await analyzeSingleDocument({
        supabase,
        requestId,
        requestedBy,
        apiKey,
        model,
        documentPath: path,
        force,
      }),
    );
  }

  await refreshRequestConflicts(supabase, requestId);
  return results;
}

async function analyzeSingleDocument({
  supabase,
  requestId,
  requestedBy,
  apiKey,
  model,
  documentPath,
  force,
}: Omit<AnalyzeRequestDocumentsOptions, 'documentPath'> & {documentPath: string; model: string}) {
  const fileName = safePdfName(documentPath);
  const {data: existingRun} = await supabase
    .from('document_analysis_runs')
    .select('id, status')
    .eq('request_id', requestId)
    .eq('document_path', documentPath)
    .eq('prompt_version', DOCUMENT_EXTRACTION_PROMPT_VERSION)
    .eq('schema_version', DOCUMENT_EXTRACTION_SCHEMA_VERSION)
    .eq('is_current', true)
    .maybeSingle();

  if (existingRun?.status === 'completed' && !force) {
    const {count} = await supabase
      .from('document_facts')
      .select('id', {count: 'exact', head: true})
      .eq('analysis_run_id', existingRun.id);
    return {documentPath, status: 'cached' as const, factCount: count ?? 0};
  }

  const now = new Date().toISOString();
  const {data: run, error: runError} = await supabase
    .from('document_analysis_runs')
    .insert({
      request_id: requestId,
      document_path: documentPath,
      file_name: fileName,
      model,
      prompt_version: DOCUMENT_EXTRACTION_PROMPT_VERSION,
      schema_version: DOCUMENT_EXTRACTION_SCHEMA_VERSION,
      status: 'running',
      is_current: false,
      document_summary: null,
      raw_response: null,
      error_message: null,
      requested_by: requestedBy,
      updated_at: now,
    })
    .select('id')
    .single();

  if (runError || !run?.id) {
    return {documentPath, status: 'failed' as const, factCount: 0, error: 'Die Prüfung konnte nicht vorbereitet werden.'};
  }

  try {
    const {data: file, error: downloadError} = await supabase.storage.from('documents').download(documentPath);
    if (downloadError || !file) throw new Error('DOCUMENT_DOWNLOAD_FAILED');
    if (file.size === 0 || file.size > MAX_PDF_SIZE) throw new Error('INVALID_PDF_SIZE');

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasPdfMagicBytes(buffer)) throw new Error('INVALID_PDF_MAGIC');

    const execution = await extractDocumentFacts({buffer, documentPath, fileName, apiKey, model});
    if (execution.result.facts.length > 0) {
      const {error: factsError} = await supabase.from('document_facts').insert(
        execution.result.facts.map((fact) => ({
          request_id: requestId,
          analysis_run_id: run.id,
          document_path: fact.documentPath,
          file_name: fact.fileName,
          field_key: fact.fieldKey,
          normalized_value: fact.normalizedValue,
          fact_metadata: fact.metadata,
          original_value: fact.originalValue,
          page_number: fact.pageNumber,
          evidence_text: fact.evidenceText,
          confidence: fact.confidence,
          extraction_notes: fact.extractionNotes,
          review_status: fact.status,
        })),
      );
      if (factsError) throw new Error('FACT_INSERT_FAILED');
    }

    const {error: summaryError} = await supabase
      .from('document_analysis_runs')
      .update({
        document_summary: execution.result.documentSummary,
        raw_response: {
          documentSummary: execution.result.documentSummary,
          facts: execution.result.facts,
          pageCount: execution.pageCount,
        },
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', run.id);
    if (summaryError) throw new Error('RUN_COMPLETION_FAILED');

    const {error: completeError} = await supabase.rpc('complete_document_analysis_run', {
      p_run_id: run.id,
    });
    if (completeError) throw new Error('RUN_COMPLETION_FAILED');

    return {
      documentPath,
      status: 'completed' as const,
      factCount: execution.result.facts.length,
    };
  } catch (error) {
    const safeError = getSafeAnalysisError(error);
    await supabase
      .from('document_analysis_runs')
      .update({
        status: 'failed',
        is_current: false,
        error_message: safeError,
        updated_at: new Date().toISOString(),
      })
      .eq('id', run.id);
    return {documentPath, status: 'failed' as const, factCount: 0, error: safeError};
  }
}

function getSafeAnalysisError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'DOCUMENT_DOWNLOAD_FAILED') return 'Das Dokument konnte nicht geladen werden.';
    if (error.message === 'INVALID_PDF_SIZE') return 'Das PDF ist leer oder größer als 15 MB.';
    if (error.message === 'INVALID_PDF_MAGIC') return 'Die Datei ist kein gültiges PDF.';
    if (error.message.includes('JSON') || error.message.includes('KI-Antwort') || error.message.includes('Fakt ')) {
      return 'Die erkannten Angaben hatten ein ungültiges Format und wurden nicht gespeichert.';
    }
  }
  return 'Das Dokument konnte momentan nicht geprüft werden.';
}
