import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
    const body = await request.json();
    const { to, name, type, propertyAddress, resultValue } = body;
    const resend = getResendClient();

    if (!to || !name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!resend) {
      return NextResponse.json({ error: 'RESEND_API_KEY is missing' }, { status: 500 });
    }

    let subject = '';
    let html = '';
    let attachments: {filename: string; content: string; contentType?: string}[] | undefined;

    // 1. Confirmation Email (Sent when user submits the form)
    if (type === 'confirmation') {
      subject = 'Ihre Anfrage zur Restnutzungsdauer ist eingegangen';
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #18181b; padding: 20px;">
          <h1 style="color: #18181b; font-size: 24px; font-weight: 600; margin-bottom: 24px;">Hallo ${name},</h1>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            vielen Dank für Ihre Anfrage zur Ermittlung der Restnutzungsdauer für Ihre Immobilie${propertyAddress ? ` (<strong>${propertyAddress}</strong>)` : ''}.
          </p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            Wir haben Ihre Unterlagen erfolgreich erhalten und werden diese nun umgehend prüfen. 
            In der Regel erhalten Sie innerhalb von 48 Stunden eine erste Rückmeldung von uns.
          </p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            Sollten wir noch weitere Informationen benötigen, kommen wir direkt auf Sie zu.
          </p>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin-bottom: 32px;" />
          <p style="font-size: 14px; color: #71717a; line-height: 1.5;">
            Mit freundlichen Grüßen,<br />
            <strong>Ihr Team von Restnutzungsdauer-Gutachten</strong>
          </p>
        </div>
      `;
    } 
    // 2. Result Email (Sent by Admin from the Dashboard)
    else if (type === 'result') {
      // --- Generate PDF ---
      try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const { width, height } = page.getSize();
        
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        // Header
        page.drawText('GUTACHTEN ZUR RESTNUTZUNGSDAUER', {
          x: 50,
          y: height - 80,
          size: 24,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.1),
        });
        
        page.drawLine({
          start: { x: 50, y: height - 100 },
          end: { x: width - 50, y: height - 100 },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });

        // Client Info
        page.drawText(`Datum: ${new Date().toLocaleDateString('de-DE')}`, { x: 50, y: height - 140, size: 12, font });
        page.drawText(`Kunde: ${name}`, { x: 50, y: height - 160, size: 12, font });
        if (propertyAddress) {
          page.drawText(`Objekt: ${propertyAddress}`, { x: 50, y: height - 180, size: 12, font });
        }

        // Result Box
        page.drawRectangle({
          x: 50,
          y: height - 320,
          width: width - 100,
          height: 100,
          color: rgb(0.96, 0.96, 0.96),
          borderColor: rgb(0.9, 0.9, 0.9),
          borderWidth: 1,
        });

        page.drawText('Ermittelte Restnutzungsdauer:', {
          x: 70,
          y: height - 260,
          size: 14,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        });

        page.drawText(`${resultValue} Jahre`, {
          x: 70,
          y: height - 295,
          size: 28,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.1),
        });

        // Footer Text
        page.drawText('Dieses Dokument dient als Nachweis für die steuerliche Geltendmachung.', {
          x: 50,
          y: height - 380,
          size: 10,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        });

        const pdfBytes = await pdfDoc.save();

        attachments = [
          {
            filename: `Gutachten_Restnutzungsdauer_${new Date().toISOString().split('T')[0]}.pdf`,
            content: Buffer.from(pdfBytes).toString('base64'),
            contentType: 'application/pdf',
          },
        ];

      } catch (pdfError) {
        console.error('Error generating PDF attachment:', pdfError);
        // Continue without attachment if it fails
      }

      subject = 'Ihr Gutachten zur Restnutzungsdauer ist fertiggestellt';
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #18181b; padding: 20px;">
          <h1 style="color: #18181b; font-size: 24px; font-weight: 600; margin-bottom: 24px;">Hallo ${name},</h1>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            wir haben die Prüfung Ihrer Unterlagen für die Immobilie${propertyAddress ? ` (<strong>${propertyAddress}</strong>)` : ''} abgeschlossen.
          </p>
          
          <div style="background-color: #f4f4f5; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <p style="font-size: 14px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; margin-top: 0;">Ermittelte Restnutzungsdauer</p>
            <p style="font-size: 32px; font-weight: 300; color: #18181b; margin: 0;">${resultValue} Jahre</p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Ihr vollständiges Gutachten liegt dieser E-Mail als PDF bei.
          </p>
          ${attachments ? '' : '<p style="color: #ef4444;">Das PDF konnte leider nicht generiert werden. Bitte kontaktieren Sie uns.</p>'}

          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            Bei Rückfragen stehen wir Ihnen jederzeit gerne zur Verfügung.
          </p>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin-bottom: 32px;" />
          <p style="font-size: 14px; color: #71717a; line-height: 1.5;">
            Mit freundlichen Grüßen,<br />
            <strong>Ihr Team von Restnutzungsdauer-Gutachten</strong>
          </p>
        </div>
      `;
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    // Send the email using Resend
    const data = await resend.emails.send({
      from: getResendFromAddress('Gutachten Team'), // Replace with your verified domain later
      to: [to],
      replyTo: getReplyTo(),
      subject: subject,
      html: html,
      attachments,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
