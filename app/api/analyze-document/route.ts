import {NextResponse} from 'next/server';
import {authorizeTeamAdmin} from '@/lib/admin/authorize-team-admin';
import {
  analyzeRequestDocuments,
  DocumentAnalysisRequestError,
} from '@/lib/rnd/document-analysis/service';
import {consumeRateLimit, getRequestFingerprint} from '@/lib/rnd/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 300;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const authorization = await authorizeTeamAdmin(request);
  if (!authorization.ok) {
    return NextResponse.json({error: authorization.error}, {status: authorization.status});
  }

  const limit = consumeRateLimit(
    `openai-document:${authorization.user.id}:${getRequestFingerprint(request)}`,
    12,
    60 * 60 * 1000,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      {error: 'Zu viele Dokumentprüfungen. Bitte versuchen Sie es später erneut.'},
      {status: 429, headers: {'Retry-After': String(limit.retryAfterSeconds)}},
    );
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({error: 'Die Dokumentprüfung ist noch nicht eingerichtet.'}, {status: 503});
  }

  try {
    const body = (await request.json()) as {
      requestId?: unknown;
      path?: unknown;
      force?: unknown;
    };
    const requestId = typeof body.requestId === 'string' ? body.requestId.trim() : '';
    const documentPath = typeof body.path === 'string' ? body.path.trim() : undefined;
    const force = body.force === true;

    if (!UUID_PATTERN.test(requestId)) {
      return NextResponse.json({error: 'Die Anfrage ist ungültig.'}, {status: 400});
    }

    const results = await analyzeRequestDocuments({
      supabase: authorization.supabase,
      requestId,
      requestedBy: authorization.user.id,
      apiKey,
      model: process.env.OPENAI_MODEL?.trim() || undefined,
      documentPath,
      force,
    });
    const completed = results.filter((result) => result.status !== 'failed').length;

    if (completed === 0) {
      return NextResponse.json(
        {error: results[0]?.error ?? 'Die Dokumente konnten momentan nicht geprüft werden.', results},
        {status: 502},
      );
    }

    return NextResponse.json(
      {success: true, results},
      {headers: {'Cache-Control': 'no-store'}},
    );
  } catch (error) {
    if (error instanceof DocumentAnalysisRequestError) {
      return NextResponse.json({error: error.message}, {status: error.status});
    }
    console.error('Structured document analysis failed:', error);
    return NextResponse.json({error: 'Die Dokumentprüfung ist momentan nicht verfügbar.'}, {status: 502});
  }
}
