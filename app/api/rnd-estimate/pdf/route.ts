import {NextResponse} from 'next/server';
import {calculateRndV2} from '@/lib/rnd/calculate-rnd';
import {normalizePublicRndV2Input} from '@/lib/rnd/input-version';
import {createRndSummaryPdf} from '@/lib/rnd/pdf-summary';
import type {RndPropertyContext} from '@/lib/rnd/types';
import {consumeRateLimit, getRequestFingerprint} from '@/lib/rnd/rate-limit';

export async function POST(request: Request) {
  const limit = consumeRateLimit(`pdf:${getRequestFingerprint(request)}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({error: 'Zu viele PDF-Anfragen. Bitte versuchen Sie es später erneut.'}, {status: 429, headers: {'Retry-After': String(limit.retryAfterSeconds)}});
  }

  try {
    const body = (await request.json()) as {input?: unknown; property?: RndPropertyContext};
    const input = normalizePublicRndV2Input(body.input);
    if (!input) {
      return NextResponse.json({error: 'Die Berechnungsdaten sind ungültig.'}, {status: 400});
    }
    const result = calculateRndV2(input);
    const pdf = await createRndSummaryPdf(result, body.property ?? {});
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="RND-Ersteinschaetzung.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('RND PDF generation failed:', error);
    return NextResponse.json({error: 'Die PDF-Zusammenfassung konnte nicht erstellt werden.'}, {status: 500});
  }
}
