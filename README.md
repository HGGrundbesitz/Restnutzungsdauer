# RND Gutachten

Next.js-Anwendung mit Landingpage, deterministischer RND-Ersteinschätzung, Supabase-Adminbereich, privatem Dokument-Upload und optionaler OpenAI-Dokumentanalyse.

## Lokale Konfiguration

1. `.env.example` nach `.env.local` übertragen.
2. Supabase-Projekt aktivieren und die Migrationen anwenden.
3. OpenAI-Key unter `OPENAI_API_KEY` ausschließlich serverseitig setzen.
4. Entwicklungsserver mit `npm run dev` starten.

Die Dokumentanalyse verwendet die OpenAI Responses API. Standardmodell ist `gpt-5.4-mini`; über `OPENAI_MODEL` kann ein anderes kompatibles Modell gesetzt werden.

## Wichtige Befehle

```bash
npm run lint
npm run test:rnd
npm run build
```

Die KI-Analyse ist nur für angemeldete Team-Admins verfügbar. Sie extrahiert mögliche Angaben aus PDFs, ersetzt aber keine sachverständige Prüfung und berechnet keine Restnutzungsdauer.
