import {NextResponse} from 'next/server';
import {authorizeTeamAdmin} from '@/lib/admin/authorize-team-admin';
import {normalizeExtractedValue} from '@/lib/rnd/document-analysis/normalization';
import {refreshRequestConflicts} from '@/lib/rnd/document-analysis/repository';
import type {DocumentFactRecord, NormalizedFactValue} from '@/lib/rnd/document-analysis/types';

type RouteContext = {params: Promise<{factId: string}>};
type ReviewAction = 'accept' | 'edit' | 'reject';

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await authorizeTeamAdmin(request);
  if (!authorization.ok) {
    return NextResponse.json({error: authorization.error}, {status: authorization.status});
  }

  try {
    const {factId} = await context.params;
    const body = (await request.json()) as {action?: unknown; value?: unknown};
    const action = body.action as ReviewAction;
    if (!['accept', 'edit', 'reject'].includes(action)) {
      return NextResponse.json({error: 'Die Prüfaktion ist ungültig.'}, {status: 400});
    }

    const {data: current, error: currentError} = await authorization.supabase
      .from('document_facts')
      .select('*')
      .eq('id', factId)
      .maybeSingle();
    if (currentError || !current) {
      return NextResponse.json({error: 'Die erkannte Angabe wurde nicht gefunden.'}, {status: 404});
    }
    const fact = current as DocumentFactRecord;

    let reviewStatus: DocumentFactRecord['review_status'];
    let reviewedValue: NormalizedFactValue = null;
    if (action === 'reject') {
      reviewStatus = 'rejected';
    } else if (action === 'accept') {
      reviewStatus = 'accepted';
      reviewedValue = fact.normalized_value;
    } else {
      if (!isEditableValue(body.value)) {
        return NextResponse.json({error: 'Bitte geben Sie einen gültigen Wert ein.'}, {status: 400});
      }
      const normalized = normalizeExtractedValue(fact.field_key, body.value);
      if (normalized === null) {
        return NextResponse.json({error: 'Der bearbeitete Wert passt nicht zu diesem Feld.'}, {status: 400});
      }
      reviewStatus = 'edited';
      reviewedValue = normalized;
    }

    const {data: updatedRows, error: updateError} = await authorization.supabase.rpc(
      'review_document_fact',
      {
        p_fact_id: factId,
        p_review_status: reviewStatus,
        p_reviewed_value: reviewedValue,
        p_admin_user_id: authorization.user.id,
      },
    );
    const updated = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
    if (updateError || !updated) {
      return NextResponse.json({error: 'Die Prüfentscheidung konnte nicht gespeichert werden.'}, {status: 500});
    }

    await refreshRequestConflicts(authorization.supabase, fact.request_id);
    return NextResponse.json({fact: updated}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    console.error('Document fact review failed:', error);
    return NextResponse.json({error: 'Die Prüfentscheidung konnte nicht gespeichert werden.'}, {status: 500});
  }
}

function isEditableValue(value: unknown): value is NormalizedFactValue {
  return value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));
}
