import {NextResponse} from 'next/server';
import {authorizeTeamAdmin} from '@/lib/admin/authorize-team-admin';
import {normalizeExtractedValue} from '@/lib/rnd/document-analysis/normalization';
import type {DocumentConflictRecord, NormalizedFactValue} from '@/lib/rnd/document-analysis/types';

type RouteContext = {params: Promise<{conflictId: string}>};

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await authorizeTeamAdmin(request);
  if (!authorization.ok) {
    return NextResponse.json({error: authorization.error}, {status: authorization.status});
  }

  try {
    const {conflictId} = await context.params;
    const body = (await request.json()) as {action?: unknown; value?: unknown};
    if (body.action !== 'resolve' && body.action !== 'acknowledge') {
      return NextResponse.json({error: 'Die Konfliktaktion ist ungültig.'}, {status: 400});
    }

    const {data: current, error: currentError} = await authorization.supabase
      .from('document_conflicts')
      .select('*')
      .eq('id', conflictId)
      .maybeSingle();
    if (currentError || !current) {
      return NextResponse.json({error: 'Der Widerspruch wurde nicht gefunden.'}, {status: 404});
    }
    const conflict = current as DocumentConflictRecord;

    let resolvedValue: NormalizedFactValue = null;
    if (body.action === 'resolve') {
      if (!isEditableValue(body.value)) {
        return NextResponse.json({error: 'Bitte geben Sie den bestätigten Wert ein.'}, {status: 400});
      }
      resolvedValue = normalizeExtractedValue(conflict.field_key, body.value);
      if (resolvedValue === null) {
        return NextResponse.json({error: 'Der bestätigte Wert passt nicht zu diesem Feld.'}, {status: 400});
      }
    }

    const now = new Date().toISOString();
    const {data: updated, error: updateError} = await authorization.supabase
      .from('document_conflicts')
      .update({
        resolution_status: body.action === 'resolve' ? 'resolved' : 'acknowledged',
        resolved_value: resolvedValue,
        resolved_by: authorization.user.id,
        resolved_at: now,
        updated_at: now,
      })
      .eq('id', conflictId)
      .select('*')
      .single();
    if (updateError || !updated) {
      return NextResponse.json({error: 'Der Widerspruch konnte nicht gespeichert werden.'}, {status: 500});
    }

    return NextResponse.json({conflict: updated}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    console.error('Document conflict resolution failed:', error);
    return NextResponse.json({error: 'Der Widerspruch konnte nicht gespeichert werden.'}, {status: 500});
  }
}

function isEditableValue(value: unknown): value is NormalizedFactValue {
  return value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));
}

