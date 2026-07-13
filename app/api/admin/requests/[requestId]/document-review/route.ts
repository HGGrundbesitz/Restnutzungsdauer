import {NextResponse} from 'next/server';
import {authorizeTeamAdmin} from '@/lib/admin/authorize-team-admin';
import {loadReviewBundle} from '@/lib/rnd/document-analysis/review-bundle';

export const runtime = 'nodejs';

type RouteContext = {params: Promise<{requestId: string}>};

export async function GET(request: Request, context: RouteContext) {
  const authorization = await authorizeTeamAdmin(request);
  if (!authorization.ok) {
    return NextResponse.json({error: authorization.error}, {status: authorization.status});
  }

  try {
    const {requestId} = await context.params;
    const {data: requestRow, error: requestError} = await authorization.supabase
      .from('property_requests')
      .select('id')
      .eq('id', requestId)
      .maybeSingle();
    if (requestError || !requestRow) {
      return NextResponse.json({error: 'Die Anfrage wurde nicht gefunden.'}, {status: 404});
    }

    const bundle = await loadReviewBundle(authorization.supabase, requestId);
    return NextResponse.json(bundle, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    console.error('Document review loading failed:', error);
    return NextResponse.json({error: 'Die Dokumentprüfung konnte nicht geladen werden.'}, {status: 500});
  }
}

