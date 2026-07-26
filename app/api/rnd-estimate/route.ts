import {NextResponse} from 'next/server';
import {Resend} from 'resend';
import {calculateRndV2} from '@/lib/rnd/calculate-rnd';
import {
  createCustomerEmailHtml,
  createInternalEmailHtml,
} from '@/lib/rnd/email-copy';
import {normalizePublicRndV2Input} from '@/lib/rnd/input-version';
import {createRndSummaryPdf} from '@/lib/rnd/pdf-summary';
import type {RndContact, RndPropertyContext, RndResult} from '@/lib/rnd/types';
import {consumeRateLimit, getRequestFingerprint} from '@/lib/rnd/rate-limit';
import {getSupabaseAdminClient} from '@/lib/supabase-admin';
import {verifyUploadCleanupToken} from '@/lib/rnd/upload-cleanup-token';
import {isValidGermanPhone, normalizeGermanPhone} from '@/lib/rnd/phone';

const PRIVACY_POLICY_VERSION = '2026-07';

export async function POST(request: Request) {
  const limit = consumeRateLimit(`submit:${getRequestFingerprint(request)}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'}, {status: 429, headers: {'Retry-After': String(limit.retryAfterSeconds)}});
  }

  try {
    const body = (await request.json()) as {
      input?: unknown;
      contact?: RndContact;
      property?: RndPropertyContext;
      documentUploads?: Array<{path?: string; cleanupToken?: string}>;
      honeypot?: string;
    };

    if (body.honeypot) {
      return NextResponse.json({result: null}, {status: 200});
    }
    const input = normalizePublicRndV2Input(body.input);
    if (!input) {
      return NextResponse.json({error: 'Die Berechnungsdaten sind ungültig.'}, {status: 400});
    }
    const contactValidation = validateContact(body.contact);
    if (!contactValidation.valid) {
      return NextResponse.json({error: contactValidation.error}, {status: 400});
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({error: 'Die Anfrage kann momentan nicht gesendet werden. Bitte versuchen Sie es später erneut.'}, {status: 503});
    }

    const result = calculateRndV2(input);
    const submittedContact = body.contact as RndContact;
    const contact: RndContact = {
      ...submittedContact,
      firstName: submittedContact.firstName.trim(),
      lastName: submittedContact.lastName.trim(),
      email: submittedContact.email.trim().toLowerCase(),
      phone: normalizeGermanPhone(submittedContact.phone) || undefined,
    };
    const property = sanitizeProperty(body.property);
    const documentUploads = sanitizeDocumentUploads(body.documentUploads);
    const documentPaths = documentUploads.map((upload) => upload.path);
    const fullName = `${contact.firstName.trim()} ${contact.lastName.trim()}`;
    const quickCheckAnswers = createAdminSummary(result, property);

    const {data: requestRow, error: requestError} = await supabase
      .from('property_requests')
      .insert({
        name: fullName,
        email: contact.email,
        phone: contact.phone || null,
        address: property.address || 'Nicht angegeben',
        year: result.constructionYear,
        documents: documentPaths,
        source: 'rnd_estimate',
        quick_check_answers: quickCheckAnswers,
        privacy_consent_at: new Date().toISOString(),
        privacy_policy_version: PRIVACY_POLICY_VERSION,
      })
      .select('id')
      .single();

    if (requestError || !requestRow?.id) {
      console.error('Property request insert failed:', requestError);
      await cleanupUploads(supabase, documentPaths);
      return NextResponse.json({error: 'Die Anfrage konnte nicht gespeichert werden.'}, {status: 500});
    }

    const {error: estimateError} = await supabase.from('rnd_estimates').insert({
      request_id: requestRow.id,
      model_version: result.modelVersion,
      stichtag: result.referenceDate,
      building_type_code: result.buildingTypeCode,
      building_type_label: result.buildingTypeLabel,
      gnd_years: result.gndYears,
      construction_year: result.constructionYear,
      actual_age: result.actualAge,
      preliminary_rnd: result.preliminaryRnd,
      modernization_points_raw: result.modernizationPointsRaw,
      modernization_points_rounded: result.modernizationPointsRounded,
      modified_rnd: result.modifiedRnd,
      calculation_method: result.calculationMethod,
      relative_age: result.relativeAge,
      coefficient_snapshot: result.coefficient,
      raw_answers: {
        schemaVersion: 'rnd-v2',
        input,
        property,
      },
      warnings: result.warnings,
      result_status: result.status,
      result_copy_version: result.resultCopyVersion,
    });

    if (estimateError) {
      console.error('RND estimate insert failed:', estimateError);
      await supabase.from('property_requests').delete().eq('id', requestRow.id);
      await cleanupUploads(supabase, documentPaths);
      return NextResponse.json({error: 'Das Rechenprotokoll konnte nicht gespeichert werden. Bitte prüfen Sie die Datenbankmigration.'}, {status: 500});
    }

    let emailWarning: string | null = null;
    try {
      await sendEmails({contact, property, result, requestId: requestRow.id, documentPaths});
    } catch (emailError) {
      console.error('RND estimate email failed after save:', emailError);
      emailWarning = 'Die Anfrage wurde gespeichert, aber die E-Mail konnte gerade nicht gesendet werden.';
    }

    return NextResponse.json({success: true, requestId: requestRow.id, result, warning: emailWarning});
  } catch (error) {
    console.error('RND estimate submission failed:', error);
    return NextResponse.json({error: 'Die Ersteinschätzung konnte gerade nicht verarbeitet werden.'}, {status: 500});
  }
}

function validateContact(contact?: RndContact): {valid: true} | {valid: false; error: string} {
  if (!contact?.firstName?.trim() || !contact.lastName?.trim() || !contact.email?.trim()) return {valid: false, error: 'Vorname, Nachname und E-Mail-Adresse sind erforderlich.'};
  if (contact.firstName.trim().length > 120 || contact.lastName.trim().length > 120) return {valid: false, error: 'Der eingegebene Name ist zu lang.'};
  if (contact.email.trim().length > 320) return {valid: false, error: 'Die E-Mail-Adresse ist zu lang.'};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) return {valid: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'};
  if (contact.phone && !isValidGermanPhone(contact.phone)) return {valid: false, error: 'Bitte geben Sie eine gültige deutsche Telefonnummer ein.'};
  if (!contact.consent) return {valid: false, error: 'Die Datenschutzeinwilligung ist erforderlich.'};
  return {valid: true};
}

function sanitizeProperty(property?: RndPropertyContext): RndPropertyContext {
  return {
    address: property?.address?.trim().slice(0, 500) || undefined,
    area: Number.isFinite(property?.area) ? Math.max(1, Math.min(Number(property?.area), 100000)) : undefined,
    units: Number.isFinite(property?.units) ? Math.max(1, Math.min(Math.round(Number(property?.units)), 1000)) : undefined,
  };
}

function sanitizeDocumentUploads(uploads?: Array<{path?: string; cleanupToken?: string}>) {
  if (!Array.isArray(uploads)) return [];
  return uploads
    .filter((upload): upload is {path: string; cleanupToken: string} =>
      typeof upload.path === 'string'
      && typeof upload.cleanupToken === 'string'
      && verifyUploadCleanupToken(upload.path, upload.cleanupToken),
    )
    .slice(0, 6);
}

async function cleanupUploads(supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>, paths: string[]) {
  if (paths.length === 0) return;
  const {error} = await supabase.storage.from('documents').remove(paths);
  if (error) console.error('Orphan upload cleanup failed:', error);
}

function createAdminSummary(result: RndResult, property: RndPropertyContext) {
  return [
    {label: 'Gebäudeart', value: result.buildingTypeLabel},
    {label: 'GND', value: result.gndYears ? `${result.gndYears} Jahre` : 'Individuelle Zuordnung'},
    {label: 'Stichtag', value: result.referenceDate},
    {label: 'Baujahr', value: String(result.constructionYear)},
    {label: 'Gebäudealter', value: `${result.actualAge} Jahre`},
    {label: 'Vorläufige RND', value: result.preliminaryRnd === null ? '-' : `${result.preliminaryRnd} Jahre`},
    {label: 'Modernisierungspunkte', value: `${result.modernizationPointsRounded} / 20`},
    {label: 'Modifizierte RND', value: result.modifiedRnd === null ? 'Manuelle Prüfung' : `${result.modifiedRnd} Jahre`},
    {label: 'Ergebnisstatus', value: result.status === 'calculated' ? 'Rechnerisch ermittelt' : 'Manuelle Prüfung'},
    {label: 'Modellversion', value: result.modelVersion},
    {label: 'Fläche', value: property.area ? `${property.area} m²` : '-'},
    {label: 'Nutzungseinheiten', value: property.units ? String(property.units) : '-'},
  ];
}

async function sendEmails({contact, property, result, requestId, documentPaths}: {contact: RndContact; property: RndPropertyContext; result: RndResult; requestId: string; documentPaths: string[]}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY ist nicht konfiguriert.');
  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const fromName = process.env.RESEND_FROM_NAME || 'RND Gutachten';
  const from = `${fromName} <${fromEmail}>`;
  const pdf = await createRndSummaryPdf(result, property);
  const userHtml = createCustomerEmailHtml(contact, result);
  const userDelivery = await resend.emails.send({from, to: [contact.email.trim()], replyTo: process.env.CONTACT_EMAIL || undefined, subject: 'Ihre unverbindliche RND-Ersteinschätzung', html: userHtml, attachments: [{filename: 'RND-Ersteinschaetzung.pdf', content: Buffer.from(pdf)}]});
  if (userDelivery.error) throw new Error(`Kunden-E-Mail fehlgeschlagen: ${userDelivery.error.message}`);

  if (process.env.CONTACT_EMAIL) {
    const internalHtml = createInternalEmailHtml({
      contact,
      property,
      result,
      requestId,
      documentCount: documentPaths.length,
    });
    const internalDelivery = await resend.emails.send({from, to: [process.env.CONTACT_EMAIL], replyTo: contact.email.trim(), subject: `Neue RND-Ersteinschätzung - ${property.address || result.buildingTypeLabel}`, html: internalHtml});
    if (internalDelivery.error) throw new Error(`Team-E-Mail fehlgeschlagen: ${internalDelivery.error.message}`);
  }
}
