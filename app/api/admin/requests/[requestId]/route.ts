import {NextResponse} from 'next/server';
import {authorizeTeamAdmin} from '@/lib/admin/authorize-team-admin';

export const runtime = 'nodejs';

type RouteContext = {params: Promise<{requestId: string}>};

const REQUEST_STATUSES = new Set(['pending', 'reviewing', 'completed']);

export async function GET(request: Request, context: RouteContext) {
  const authorization = await authorizeTeamAdmin(request);
  if (!authorization.ok) {
    return NextResponse.json({error: authorization.error}, {status: authorization.status});
  }

  try {
    const {requestId} = await context.params;
    const {data, error} = await authorization.supabase
      .from('property_requests')
      .select('*, rnd_estimates(*)')
      .eq('id', requestId)
      .maybeSingle();

    if (error) {
      console.error('Admin request loading failed:', error);
      return NextResponse.json({error: 'Die Anfrage konnte nicht geladen werden.'}, {status: 500});
    }
    if (!data) {
      return NextResponse.json({error: 'Die Anfrage wurde nicht gefunden.'}, {status: 404});
    }

    return NextResponse.json({request: data}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    console.error('Admin request loading failed unexpectedly:', error);
    return NextResponse.json({error: 'Die Anfrage konnte nicht geladen werden.'}, {status: 500});
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await authorizeTeamAdmin(request);
  if (!authorization.ok) {
    return NextResponse.json({error: authorization.error}, {status: authorization.status});
  }

  try {
    const {requestId} = await context.params;
    const body = (await request.json().catch(() => null)) as {status?: unknown} | null;
    if (typeof body?.status !== 'string' || !REQUEST_STATUSES.has(body.status)) {
      return NextResponse.json({error: 'Bitte wählen Sie einen gültigen Status.'}, {status: 400});
    }

    const {data, error} = await authorization.supabase.rpc('update_property_request_status', {
      p_request_id: requestId,
      p_new_status: body.status,
      p_admin_user_id: authorization.user.id,
    });
    if (error) {
      console.error('Admin request status update failed:', error);
      const migrationMissing =
        error.code === 'PGRST202' ||
        error.code === '42883' ||
        error.message?.includes('update_property_request_status');
      return NextResponse.json(
        {
          error: migrationMissing
            ? 'Die Statushistorie ist noch nicht eingerichtet. Bitte führen Sie zuerst die neue Supabase-Migration aus.'
            : 'Der Status konnte nicht aktualisiert werden.',
        },
        {status: migrationMissing ? 503 : 500},
      );
    }

    const updatedRequest = Array.isArray(data) ? data[0] : data;
    if (!updatedRequest) {
      return NextResponse.json({error: 'Die Anfrage wurde nicht gefunden.'}, {status: 404});
    }

    return NextResponse.json({request: updatedRequest}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    console.error('Admin request status update failed unexpectedly:', error);
    return NextResponse.json({error: 'Der Status konnte nicht aktualisiert werden.'}, {status: 500});
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const authorization = await authorizeTeamAdmin(request);
  if (!authorization.ok) {
    return NextResponse.json({error: authorization.error}, {status: authorization.status});
  }

  try {
    const {requestId} = await context.params;
    const {data: requestRow, error: requestError} = await authorization.supabase
      .from('property_requests')
      .select('id, documents')
      .eq('id', requestId)
      .maybeSingle();

    if (requestError) {
      console.error('Admin request lookup before deletion failed:', requestError);
      return NextResponse.json({error: 'Die Anfrage konnte nicht zum Löschen geladen werden.'}, {status: 500});
    }
    if (!requestRow) {
      return NextResponse.json({error: 'Die Anfrage wurde nicht gefunden.'}, {status: 404});
    }

    const {data: deletedRows, error: deleteError} = await authorization.supabase
      .from('property_requests')
      .delete()
      .eq('id', requestId)
      .select('id');

    if (deleteError || deletedRows?.length !== 1) {
      console.error('Admin request deletion failed:', deleteError);
      return NextResponse.json({error: 'Die Anfrage konnte nicht gelöscht werden.'}, {status: 500});
    }

    const documentPaths = Array.isArray(requestRow.documents)
      ? [...new Set(requestRow.documents.filter((path): path is string => typeof path === 'string' && path.length > 0))]
      : [];

    if (documentPaths.length > 0) {
      const {error: storageError} = await authorization.supabase.storage
        .from('documents')
        .remove(documentPaths);

      if (storageError) {
        console.error('Private document cleanup after request deletion failed:', {
          requestId,
          documentPaths,
          storageError,
        });
        return NextResponse.json({
          success: true,
          warning: 'Die Anfrage wurde gelöscht. Einige private Dokumente konnten jedoch nicht automatisch aus dem Speicher entfernt werden.',
        });
      }
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Admin request deletion failed unexpectedly:', error);
    return NextResponse.json({error: 'Die Anfrage konnte nicht gelöscht werden.'}, {status: 500});
  }
}
