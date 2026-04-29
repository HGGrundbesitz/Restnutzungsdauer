import {NextResponse} from 'next/server';
import {Resend} from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

function getResendFromAddress(fallbackName: string) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const fromName = process.env.RESEND_FROM_NAME || fallbackName;
  return `${fromName} <${fromEmail}>`;
}

function getReplyTo() {
  const replyTo = process.env.CONTACT_EMAIL?.trim();
  return replyTo ? replyTo : undefined;
}

export async function POST(request: Request) {
  try {
    const {name, email, address, year, documentsCount} = await request.json();
    const resend = getResendClient();

    if (!resend) {
      console.warn('RESEND_API_KEY is not set. Skipping email sending.');
      return NextResponse.json({success: true, message: 'Skipped email (no API key)'});
    }

    const userEmailResponse = await resend.emails.send({
      from: getResendFromAddress('Restnutzungsdauer-Gutachten'),
      to: [email],
      replyTo: getReplyTo(),
      subject: 'Ihre Anfrage für ein Restnutzungsdauer-Gutachten',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hallo ${name},</h2>
          <p>vielen Dank für Ihre Anfrage. Wir haben Ihre Daten und Dokumente erfolgreich erhalten.</p>
          <p><strong>Ihre Angaben:</strong></p>
          <ul>
            <li><strong>Immobilie:</strong> ${address}</li>
            <li><strong>Baujahr:</strong> ${year || 'Nicht angegeben'}</li>
            <li><strong>Hochgeladene Dokumente:</strong> ${documentsCount}</li>
          </ul>
          <p>Wir werden Ihre Unterlagen nun prüfen und uns in Kürze mit den naechsten Schritten bei Ihnen melden.</p>
          <p>Mit freundlichen Gruessen,<br />Ihr Gutachten-Team</p>
        </div>
      `,
    });

    const contactEmail = getReplyTo();
    const adminNotificationEmails = contactEmail ? [contactEmail] : [];
    let adminEmailResponse = null;

    if (adminNotificationEmails.length > 0) {
      adminEmailResponse = await resend.emails.send({
        from: getResendFromAddress('System'),
        to: adminNotificationEmails,
        replyTo: getReplyTo(),
        subject: `Neue Gutachten-Anfrage von ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Neue Anfrage eingegangen!</h2>
            <p>Ein neuer Kunde hat eine Anfrage für ein Restnutzungsdauer-Gutachten gestellt.</p>
            <p><strong>Kundendaten:</strong></p>
            <ul>
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>E-Mail:</strong> ${email}</li>
              <li><strong>Immobilie:</strong> ${address}</li>
              <li><strong>Baujahr:</strong> ${year || 'Nicht angegeben'}</li>
              <li><strong>Hochgeladene Dokumente:</strong> ${documentsCount}</li>
            </ul>
            <p>Bitte loggen Sie sich in das Admin-Dashboard ein, um die Anfrage zu bearbeiten.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({success: true, userEmailResponse, adminEmailResponse});
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({error: 'Failed to send email'}, {status: 500});
  }
}

