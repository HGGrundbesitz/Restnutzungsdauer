import {NextResponse} from 'next/server';
import {GoogleGenAI} from '@google/genai';

export const runtime = 'nodejs';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({apiKey});
}

export async function POST(request: Request) {
  try {
    const ai = getGeminiClient();

    if (!ai) {
      return NextResponse.json({error: 'Gemini API Key ist nicht konfiguriert'}, {status: 500});
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({error: 'Kein Dokument zur Analyse uebergeben'}, {status: 400});
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type || 'application/pdf',
            },
          },
          {
            text: 'Analysiere dieses Dokument fuer ein Immobiliengutachten. Extrahiere folgende Informationen, falls vorhanden: Baujahr, Wohnflaeche, Grundstuecksflaeche, Immobilientyp, erkannte Maengel oder Besonderheiten. Antworte in einem kurzen, uebersichtlichen Format auf Deutsch. Verwende Markdown fuer die Formatierung.',
          },
        ],
      },
    });

    if (!response.text) {
      return NextResponse.json({error: 'Keine Analyse von Gemini erhalten'}, {status: 502});
    }

    return NextResponse.json({analysis: response.text});
  } catch (error) {
    console.error('Error analyzing document with Gemini:', error);
    return NextResponse.json({error: 'Fehler bei der KI-Analyse'}, {status: 500});
  }
}
