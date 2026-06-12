import {NextResponse} from 'next/server';
import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import {Resend} from 'resend';

type IncomingSummaryEntry = [string, string] | {label?: string; value?: string};
type NormalizedSummaryEntry = {label: string; value: string};

let supabaseRouteClient: SupabaseClient | null = null;
let resendRouteClient: Resend | null = null;

function getSupabaseRouteClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('placeholder') ||
    supabaseAnonKey.includes('placeholder')
  ) {
    return null;
  }

  if (!supabaseRouteClient) {
    supabaseRouteClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseRouteClient;
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!resendRouteClient) {
    resendRouteClient = new Resend(apiKey);
  }

  return resendRouteClient;
}

function getFromAddress(fallbackName: string) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const fromName = process.env.RESEND_FROM_NAME || fallbackName;
  return `${fromName} <${fromEmail}>`;
}

function getReplyTo() {
  const replyTo = process.env.CONTACT_EMAIL?.trim();
  return replyTo || undefined;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });
}

function normalizeAnswers(answers: IncomingSummaryEntry[]) {
  return answers
    .map((entry) => {
      if (Array.isArray(entry)) {
        const [label, value] = entry;
        return {
          label: String(label ?? '').trim(),
          value: String(value ?? '').trim(),
        };
      }

      return {
        label: String(entry.label ?? '').trim(),
        value: String(entry.value ?? '').trim(),
      };
    })
    .filter((entry) => entry.label && entry.value);
}

function findAnswerValue(answers: NormalizedSummaryEntry[], label: string) {
  return answers.find((answer) => answer.label.toLowerCase() === label.toLowerCase())?.value;
}

async function saveQuickCheckRequest({
  name,
  email,
  phone,
  address,
  year,
  answers,
  documents,
}: {
  name: string;
  email: string;
  phone: string;
  address: string;
  year: number | null;
  answers: NormalizedSummaryEntry[];
  documents: string[];
}) {
  const supabase = getSupabaseRouteClient();

  if (!supabase) {
    return {
      ok: false,
      error: 'Supabase ist nicht konfiguriert. Bitte NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY prüfen.',
    };
  }

  const fullPayload = {
    name,
    email,
    phone,
    address,
    year,
    documents,
    source: 'quick_check',
    quick_check_answers: answers,
  };

  const {data, error} = await supabase.from('property_requests').insert(fullPayload).select('id').single();

  if (!error) {
    return {ok: true, requestId: data?.id as string | undefined, warning: null};
  }

  console.error('Quick check insert failed. Trying fallback payload:', error);

  const fallbackPayload = {
    name,
    email,
    address,
    year,
    documents,
  };

  const {data: fallbackData, error: fallbackError} = await supabase
    .from('property_requests')
    .insert(fallbackPayload)
    .select('id')
    .single();

  if (fallbackError) {
    console.error('Quick check fallback insert failed:', fallbackError);
    return {
      ok: false,
      error: fallbackError.message.includes('row-level security')
        ? 'Supabase RLS blockiert neue Anfragen. Bitte führen Sie supabase-schema.sql im Supabase SQL Editor aus.'
        : 'Die Ersteinschätzung konnte nicht in Supabase gespeichert werden. Bitte prüfen Sie die Tabelle property_requests.',
      details: fallbackError.message,
    };
  }

  return {
    ok: true,
    requestId: fallbackData?.id as string | undefined,
    warning: `Gespeichert, aber ohne Schnellcheck-Zusatzfelder. Bitte supabase-schema.sql erneut in Supabase ausführen. Originalfehler: ${error.message}`,
  };
}

async function sendQuickCheckEmails({
  name,
  firstName,
  email,
  phone,
  answers,
  documentsCount,
}: {
  name: string;
  firstName: string;
  email: string;
  phone: string;
  answers: NormalizedSummaryEntry[];
  documentsCount: number;
}) {
  const resend = getResendClient();

  if (!resend) {
    console.warn('RESEND_API_KEY is not set. Skipping quick-check emails.');
    return {emailSent: false, warning: 'RESEND_API_KEY fehlt. Anfrage wurde gespeichert, E-Mail wurde übersprungen.'};
  }

  const safeName = escapeHtml(name);
  const safeFirstName = escapeHtml(firstName || name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const summaryList = answers
    .map((entry) => `<li style="margin: 0 0 10px;"><strong>${escapeHtml(entry.label)}:</strong> ${escapeHtml(entry.value)}</li>`)
    .join('');

  await resend.emails.send({
    from: getFromAddress('Restnutzungsdauer Schnellcheck'),
    to: [email],
    replyTo: getReplyTo(),
    subject: 'Ihre unverbindliche Ersteinschätzung ist eingegangen',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #111827;">
        <h2>Hallo ${safeFirstName},</h2>
        <p>vielen Dank für Ihre unverbindliche Ersteinschätzung. Wir haben Ihre Angaben erhalten und melden uns mit einer nachvollziehbaren nächsten Einordnung bei Ihnen.</p><p>Hinweis: Der Schnellcheck ersetzt keine Steuerberatung.</p>
        <p><strong>Ihre Zusammenfassung:</strong></p>
        <ul style="padding-left: 18px; line-height: 1.6;">${summaryList}</ul>
        <p><strong>Hochgeladene Dokumente:</strong> ${documentsCount}</p>
        <p>Wenn Sie möchten, können Sie im Anschluss weitere Unterlagen über das Anfrageformular nachreichen.</p>
        <p>Mit freundlichen Grüßen<br />Ihr Gutachten-Team</p>
      </div>
    `,
  });

  const contactEmail = getReplyTo();

  if (contactEmail) {
    await resend.emails.send({
      from: getFromAddress('System'),
      to: [contactEmail],
      replyTo: email,
      subject: `Neue Schnellcheck-Anfrage von ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #111827;">
          <h2>Neue unverbindliche Ersteinschätzung</h2>
          <p>Ein Interessent hat den Schnellcheck auf der Landingpage abgeschlossen. Bitte Angaben und optionale Dokumente fachlich einordnen.</p>
          <ul style="padding-left: 18px; line-height: 1.7;">
            <li><strong>Name:</strong> ${safeName}</li>
            <li><strong>E-Mail:</strong> ${safeEmail}</li>
            <li><strong>Telefon:</strong> ${safePhone}</li>
          </ul>
          <p><strong>Antworten aus dem Schnellcheck:</strong></p>
          <ul style="padding-left: 18px; line-height: 1.6;">${summaryList}</ul>
          <p><strong>Hochgeladene Dokumente:</strong> ${documentsCount}</p>
        </div>
      `,
    });
  }

  return {emailSent: true, warning: null};
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      firstName?: string;
      email?: string;
      phone?: string;
      address?: string;
      year?: number;
      documents?: string[];
      answers?: IncomingSummaryEntry[];
    };

    const name = body.name?.trim() ?? '';
    const firstName = body.firstName?.trim() ?? '';
    const email = body.email?.trim() ?? '';
    const phone = body.phone?.trim() ?? '';
    const answers = Array.isArray(body.answers) ? normalizeAnswers(body.answers) : [];
    const documents = Array.isArray(body.documents)
      ? body.documents.filter((path): path is string => typeof path === 'string' && path.trim().length > 0)
      : [];
    const address = (body.address?.trim() || findAnswerValue(answers, 'Adresse') || 'Nicht angegeben').trim();
    const parsedYear = typeof body.year === 'number' ? body.year : Number(findAnswerValue(answers, 'Baujahr'));
    const year = Number.isFinite(parsedYear) ? Math.round(parsedYear) : null;

    if (!name || !email || !phone || answers.length === 0) {
      return NextResponse.json({error: 'Bitte prüfen Sie Name, E-Mail, Telefon und Schnellcheck-Antworten.'}, {status: 400});
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'}, {status: 400});
    }

    const saveResult = await saveQuickCheckRequest({
      name,
      email,
      phone,
      address,
      year,
      answers,
      documents,
    });

    if (!saveResult.ok) {
      return NextResponse.json(
        {error: saveResult.error, details: 'details' in saveResult ? saveResult.details : undefined},
        {status: 500},
      );
    }

    let emailResult: {emailSent: boolean; warning: string | null} = {emailSent: false, warning: null};

    try {
      emailResult = await sendQuickCheckEmails({name, firstName, email, phone, answers, documentsCount: documents.length});
    } catch (emailError) {
      console.error('Quick-check email failed after successful save:', emailError);
      emailResult = {
        emailSent: false,
        warning: 'Anfrage wurde gespeichert, aber die E-Mail konnte gerade nicht gesendet werden.',
      };
    }

    return NextResponse.json({
      success: true,
      saved: true,
      requestId: saveResult.requestId,
      emailSent: emailResult.emailSent,
      warning: saveResult.warning ?? emailResult.warning,
    });
  } catch (error) {
    console.error('Error handling quick-check submission:', error);
    return NextResponse.json({error: 'Die Ersteinschätzung konnte gerade nicht verarbeitet werden.'}, {status: 500});
  }
}
