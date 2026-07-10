import {NextResponse} from 'next/server';
import {getSupabaseAdminClient} from '@/lib/supabase-admin';
import {consumeRateLimit, getRequestFingerprint} from '@/lib/rnd/rate-limit';

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
      return NextResponse.json({error: 'Der sichere Dokumenten-Upload ist serverseitig noch nicht konfiguriert.'}, {status: 503});
    }

    const path = `rnd-estimates/${crypto.randomUUID()}/${fileName}`;
    const {data, error} = await supabase.storage.from('documents').createSignedUploadUrl(path);
    if (error || !data?.token) {
      console.error('Signed upload URL creation failed:', error);
      return NextResponse.json({error: 'Der Upload konnte nicht vorbereitet werden.'}, {status: 500});
    }
    return NextResponse.json({path, token: data.token}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    console.error('Upload URL request failed:', error);
    return NextResponse.json({error: 'Der Upload konnte nicht vorbereitet werden.'}, {status: 500});
  }
}

function sanitizeFileName(value: string) {
  const cleaned = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').toLowerCase();
  return cleaned.slice(-120) || 'dokument.pdf';
}
