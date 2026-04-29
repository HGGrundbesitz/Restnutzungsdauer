import {NextResponse} from 'next/server';
import {Resend} from 'resend';

type SummaryEntry = [string, string];

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
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

export async function POST(request: Request) {
  try {
    const {name, firstName, email, phone, answers} = (await request.json()) as {
      name?: string;
      firstName?: string;
      email?: string;
      phone?: string;
      answers?: SummaryEntry[];
    };

    if (!name || !email || !phone || !Array.isArray(answers)) {
      return NextResponse.json({error: 'Missing required fields'}, {status: 400});
    }

    const resend = getResendClient();

    if (!resend) {
      console.warn('RESEND_API_KEY is not set. Skipping quick-check emails.');
      return NextResponse.json({success: true, message: 'Skipped email (no API key)'});
    }

    const safeName = escapeHtml(name);
    const safeFirstName = escapeHtml(firstName || name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const summaryList = answers
      .map(([label, value]) => `<li style="margin: 0 0 10px;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`)
      .join('');

    await resend.emails.send({
      from: getFromAddress('Restnutzungsdauer Schnellcheck'),
      to: [email],
      replyTo: getReplyTo(),
      subject: 'Ihre digitale Ersteinschätzung ist eingegangen',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto;">
          <h2>Hallo ${safeFirstName},</h2>
          <p>vielen Dank für Ihre digitale Ersteinschätzung. Wir haben Ihre Angaben erhalten und melden uns mit den naechsten Schritten bei Ihnen.</p>
          <p><strong>Ihre Zusammenfassung:</strong></p>
          <ul style="padding-left: 18px; line-height: 1.6;">${summaryList}</ul>
          <p>Wenn Sie möchten, können Sie im Anschluss weitere Unterlagen über das Anfrageformular nachreichen.</p>
          <p>Mit freundlichen Gruessen<br />Ihr Gutachten-Team</p>
        </div>
      `,
    });

    const contactEmail = getReplyTo();
    if (contactEmail) {
      await resend.emails.send({
        from: getFromAddress('System'),
        to: [contactEmail],
        replyTo: getReplyTo(),
        subject: `Neue Schnellcheck-Anfrage von ${safeName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto;">
            <h2>Neue digitale Ersteinschätzung</h2>
            <p>Ein Interessent hat den Schnellcheck auf der Landingpage abgeschlossen.</p>
            <ul style="padding-left: 18px; line-height: 1.7;">
              <li><strong>Name:</strong> ${safeName}</li>
              <li><strong>E-Mail:</strong> ${safeEmail}</li>
              <li><strong>Telefon:</strong> ${safePhone}</li>
            </ul>
            <p><strong>Antworten aus dem Schnellcheck:</strong></p>
            <ul style="padding-left: 18px; line-height: 1.6;">${summaryList}</ul>
          </div>
        `,
      });
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Error sending quick-check email:', error);
    return NextResponse.json({error: 'Failed to send quick-check email'}, {status: 500});
  }
}

