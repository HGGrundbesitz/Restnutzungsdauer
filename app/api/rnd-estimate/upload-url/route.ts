import {NextResponse} from 'next/server';
import {getSupabaseAdminClient} from '@/lib/supabase-admin';
import {consumeRateLimit, getRequestFingerprint} from '@/lib/rnd/rate-limit';
import {createUploadCleanupToken, verifyUploadCleanupToken} from '@/lib/rnd/upload-cleanup-token';

const MAX_SIZE = 15 * 1024 * 1024;

export async function POST(request: Request) {
  const limit = consumeRateLimit(`upload:${getRequestFingerprint(request)}`, 20, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({error: 'Zu viele Upload-Anfragen. Bitte warten Sie kurz.'}, {status: 429, headers: {'Retry-After': String(limit.retryAfterSeconds)}});
  }

  try {
    const body = (await request.json()) as {fileName?: string; fileSize?: number; contentType?: string};
    const fileName = sanitizeFileName(body.fileName ?? 'dokument.pdf');
    const contentType = body.contentType || 'application/pdf';
    if (!fileName.endsWith('.pdf') || contentType !== 'application/pdf') {
      return NextResponse.json({error: 'Bitte nur PDF-Dateien hochladen.'}, {status: 400});
    }
    if (!Number.isFinite(body.fileSize) || (body.fileSize ?? 0) <= 0 || (body.fileSize ?? 0) > MAX_SIZE) {
      return NextResponse.json({error: 'Die PDF-Datei darf maximal 15 MB groß sein.'}, {status: 400});
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({error: 'Der Dokumenten-Upload ist momentan nicht verfügbar. Sie können ohne Dokumente fortfahren.'}, {status: 503});
    }

    const path = `rnd-estimates/${crypto.randomUUID()}/${fileName}`;
    const {data, error} = await supabase.storage.from('documents').createSignedUploadUrl(path);
    if (error || !data?.token) {
      console.error('Signed upload URL creation failed:', error);
      return NextResponse.json({error: 'Der Upload konnte nicht vorbereitet werden.'}, {status: 500});
    }
    return NextResponse.json(
      {path, token: data.token, cleanupToken: createUploadCleanupToken(path)},
      {headers: {'Cache-Control': 'no-store'}},
    );
  } catch (error) {
    console.error('Upload URL request failed:', error);
    return NextResponse.json({error: 'Der Upload konnte nicht vorbereitet werden.'}, {status: 500});
  }
}

export async function DELETE(request: Request) {
  const limit = consumeRateLimit(`upload-cleanup:${getRequestFingerprint(request)}`, 30, 10 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({error: 'Zu viele Anfragen.'}, {status: 429});

  try {
    const body = (await request.json()) as {uploads?: Array<{path?: string; cleanupToken?: string}>};
    const paths = (body.uploads ?? [])
      .slice(0, 6)
      .filter((upload): upload is {path: string; cleanupToken: string} =>
        typeof upload.path === 'string'
        && typeof upload.cleanupToken === 'string'
        && verifyUploadCleanupToken(upload.path, upload.cleanupToken),
      )
      .map((upload) => upload.path);

    if (paths.length === 0) return NextResponse.json({success: true});
    const supabase = getSupabaseAdminClient();
    if (!supabase) return NextResponse.json({error: 'Cleanup ist momentan nicht verfügbar.'}, {status: 503});

    const referenceChecks = await Promise.all(
      paths.map(async (path) => {
        const {data, error} = await supabase
          .from('property_requests')
          .select('id')
          .contains('documents', [path])
          .limit(1);
        return {path, referenced: Boolean(data?.length), error};
      }),
    );
    if (referenceChecks.some((check) => check.error)) {
      console.error('Uploaded document reference check failed:', referenceChecks.filter((check) => check.error));
      return NextResponse.json({error: 'Dateien konnten nicht sicher geprüft werden.'}, {status: 500});
    }
    const removablePaths = referenceChecks.filter((check) => !check.referenced).map((check) => check.path);
    if (removablePaths.length === 0) return NextResponse.json({success: true});

    const {error} = await supabase.storage.from('documents').remove(removablePaths);
    if (error) {
      console.error('Uploaded document cleanup failed:', error);
      return NextResponse.json({error: 'Dateien konnten nicht entfernt werden.'}, {status: 500});
    }
    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Upload cleanup request failed:', error);
    return NextResponse.json({error: 'Dateien konnten nicht entfernt werden.'}, {status: 500});
  }
}

function sanitizeFileName(value: string) {
  const cleaned = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').toLowerCase();
  return cleaned.slice(-120) || 'dokument.pdf';
}
