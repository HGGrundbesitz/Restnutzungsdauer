import {NextResponse} from 'next/server';
import {authorizeTeamAdmin} from '@/lib/admin/authorize-team-admin';
import {calculateRnd} from '@/lib/rnd/calculate-rnd';
import type {DocumentConflictRecord, DocumentFactRecord} from '@/lib/rnd/document-analysis/types';
import {mapReviewedFactsToInput} from '@/lib/rnd/map-reviewed-facts-to-input';
import type {RndPropertyContext} from '@/lib/rnd/types';
import {isRndInput, validateRndInput} from '@/lib/rnd/validate-input';

type RouteContext = {params: Promise<{requestId: string}>};

export async function GET(request: Request, context: RouteContext) {
  return handlePreview(request, context, false);
}

export async function POST(request: Request, context: RouteContext) {
  const body = (await request.json().catch(() => null)) as {confirm?: unknown} | null;
  if (body?.confirm !== true) {
    return NextResponse.json({error: 'Bitte bestätigen Sie die neue Berechnung ausdrücklich.'}, {status: 400});
  }
  return handlePreview(request, context, true);
}

async function handlePreview(request: Request, context: RouteContext, persist: boolean) {
  const authorization = await authorizeTeamAdmin(request);
  if (!authorization.ok) {
    return NextResponse.json({error: authorization.error}, {status: authorization.status});
  }

  try {
    const {requestId} = await context.params;
    const [estimateResult, runsResult] = await Promise.all([
      authorization.supabase
        .from('rnd_estimates')
        .select('raw_answers')
        .eq('request_id', requestId)
        .maybeSingle(),
      authorization.supabase
        .from('document_analysis_runs')
        .select('id')
        .eq('request_id', requestId)
        .eq('status', 'completed')
        .eq('is_current', true),
    ]);

    if (estimateResult.error || !estimateResult.data) {
      return NextResponse.json({error: 'Für diese Anfrage ist keine Ersteinschätzung gespeichert.'}, {status: 404});
    }
    if (runsResult.error) {
      return NextResponse.json({error: 'Die bestätigten Dokumentangaben konnten nicht geladen werden.'}, {status: 500});
    }

    const currentRunIds = (runsResult.data ?? []).map((run) => run.id);
    let facts: DocumentFactRecord[] = [];
    let conflicts: DocumentConflictRecord[] = [];
    if (currentRunIds.length > 0) {
      const [factsResult, conflictsResult] = await Promise.all([
        authorization.supabase
          .from('document_facts')
          .select('id, field_key, normalized_value, reviewed_value, review_status')
          .eq('request_id', requestId)
          .in('analysis_run_id', currentRunIds),
        authorization.supabase
          .from('document_conflicts')
          .select('field_key, fact_ids, resolution_status, resolved_value')
          .eq('request_id', requestId),
      ]);
      if (factsResult.error || conflictsResult.error) {
        return NextResponse.json({error: 'Die bestätigten Dokumentangaben konnten nicht geladen werden.'}, {status: 500});
      }
      const currentFacts = (factsResult.data ?? []) as DocumentFactRecord[];
      facts = currentFacts.filter((fact) => fact.review_status === 'accepted' || fact.review_status === 'edited');
      const currentFactIds = new Set(currentFacts.map((fact) => fact.id));
      conflicts = ((conflictsResult.data ?? []) as DocumentConflictRecord[]).filter((conflict) =>
        conflict.fact_ids.some((factId) => currentFactIds.has(factId)),
      );
    }

    const rawAnswers = asRecord(estimateResult.data.raw_answers);
    const originalInput = rawAnswers?.input;
    if (!isRndInput(originalInput)) {
      return NextResponse.json({error: 'Die ursprünglichen Rechenangaben sind unvollständig.'}, {status: 409});
    }
    const originalProperty = sanitizeProperty(rawAnswers?.property);
    const preview = mapReviewedFactsToInput({
      originalInput,
      originalProperty,
      facts,
      conflicts,
    });
    const inputValidation = validateRndInput(preview.input);
    const canCalculate = preview.canCalculate && inputValidation.valid;
    const responsePreview = {
      ...preview,
      canCalculate,
      warnings: inputValidation.valid
        ? preview.warnings
        : [...preview.warnings, ...inputValidation.errors],
    };

    if (!persist) {
      return NextResponse.json({preview: responsePreview}, {headers: {'Cache-Control': 'no-store'}});
    }
    if (!canCalculate) {
      return NextResponse.json(
        {error: 'Offene Widersprüche oder ungültige Angaben müssen zuerst geprüft werden.', preview: responsePreview},
        {status: 409},
      );
    }

    const result = calculateRnd(preview.input);
    const {data: snapshot, error: snapshotError} = await authorization.supabase
      .from('rnd_calculation_snapshots')
      .insert({
        request_id: requestId,
        source_fact_ids: preview.sourceFactIds,
        original_input: originalInput,
        approved_input: preview.input,
        property_snapshot: preview.property,
        result_snapshot: result,
        calculator_model_version: result.modelVersion,
        warnings: [...preview.warnings, ...result.warnings.map((warning) => warning.message)],
        approved_by: authorization.user.id,
      })
      .select('id, created_at')
      .single();
    if (snapshotError || !snapshot) {
      return NextResponse.json({error: 'Die neue Berechnung konnte nicht gespeichert werden.'}, {status: 500});
    }

    return NextResponse.json(
      {preview: responsePreview, result, snapshot},
      {headers: {'Cache-Control': 'no-store'}},
    );
  } catch (error) {
    console.error('Reviewed fact calculation failed:', error);
    return NextResponse.json({error: 'Die Rechenwerte konnten nicht vorbereitet werden.'}, {status: 500});
  }
}

function sanitizeProperty(value: unknown): RndPropertyContext {
  const record = asRecord(value);
  return {
    address: typeof record?.address === 'string' ? record.address : undefined,
    area: typeof record?.area === 'number' && Number.isFinite(record.area) ? record.area : undefined,
    units: typeof record?.units === 'number' && Number.isFinite(record.units) ? record.units : undefined,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}
