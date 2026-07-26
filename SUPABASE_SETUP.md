# Supabase-Setup für RND Gutachten

Diese Anleitung beschreibt den kanonischen Repository-Stand für ein neues
Supabase-Projekt. `supabase/migrations/supabasefiles.sql` ist nur ein Vergleich
mit dem aktuellen Live-Stand und keine Migration, die von oben bis unten
ausgeführt werden darf.

Bestehende Production-Projekte werden nicht mit `supabase-schema.sql` neu
aufgebaut. Dort müssen die einzelnen Änderungen zuerst gegen den Live-Stand
geprüft, separat freigegeben und anschließend kontrolliert ausgeführt werden.

## 1. Umgebungsvariablen

In `.env.local` eintragen. Werte niemals in Git committen oder in Chats posten.

```env
SUPABASE_URL=https://DEIN-PROJECT-REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4-mini

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=anfragen@deine-domain.de
RESEND_FROM_NAME=RND Gutachten
CONTACT_EMAIL=team@deine-domain.de
```

`SUPABASE_PUBLISHABLE_KEY` darf im Browser verwendet werden. Alle anderen
Schlüssel sind ausschließlich serverseitig. Nach Änderungen den Dev-Server
vollständig neu starten.

## 2. Kanonische Reihenfolge für ein leeres Projekt

Die Dateien im Supabase SQL Editor genau in dieser Reihenfolge ausführen:

1. `supabase-schema.sql` – Basisschema, RLS und privater Storage-Bucket.
2. `supabase/migrations/20260712180000_document_review_workflow.sql` –
   Dokumentanalyse, Fakten, Konflikte, Audit Log und Snapshots.
3. `supabase/migrations/20260713120000_harden_document_review_history.sql` –
   Current-Run-Historie, atomare Review-Funktion und unveränderliche
   Audit-/Snapshot-Datensätze.
4. `supabase/migrations/20260725150000_add_document_fact_metadata.sql` –
   strukturiertes `fact_metadata` auf `public.document_facts`.
5. `supabase/migrations/20260726120000_request_status_audit.sql` –
   unveränderliche Statushistorie und atomare, ausschließlich serverseitige
   Statuswechsel.
6. `supabase/add-admin.sql` – separat und nur nach dem Anlegen des jeweiligen
   Auth-Benutzers.
7. `supabase/verify-setup.sql` – ausschließlich lesende Abschlussprüfung.

Die Admin-Datei ist absichtlich kein allgemeiner Bootstrap: E-Mail und
Auth-User-ID unterscheiden sich je Umgebung.

## 3. Erster Admin und Supabase Auth

Unter `Authentication -> Users` einen Benutzer mit starkem Passwort anlegen und
die E-Mail bestätigen. Danach in `supabase/add-admin.sql`
`ADMIN_EMAIL_HIER_EINTRAGEN` ersetzen und die Datei ausführen.

Empfohlene Auth-Einstellungen:

- öffentliche Registrierungen deaktivieren;
- anonyme Logins deaktiviert lassen;
- Passwortlänge mindestens 10, besser 12 Zeichen;
- für Produktion einen eigenen SMTP-Dienst konfigurieren;
- lokale Site URL `http://localhost:3000`;
- lokaler Redirect `http://localhost:3000/admin/reset-password`;
- Produktionsdomain und Reset-URL zusätzlich freigeben.

Ein Auth-Benutzer erhält nur dann Dashboard-Zugriff, wenn er zusätzlich als
aktiver Admin in `public.admin_users` eingetragen ist.

## 4. Sicherheitsmodell

- Das öffentliche Formular schreibt nur über die abgesicherte Next.js-Route.
- Kundendaten und PDFs sind für `anon` nicht lesbar.
- Der Bucket `documents` bleibt privat und akzeptiert nur PDF-Dateien bis 15 MB.
- Die Dokumentanalyse berechnet keine RND und übernimmt keinen Wert automatisch.
- Nur akzeptierte oder manuell bearbeitete Fakten dürfen eine neue,
  deterministische Berechnung und einen unveränderlichen Snapshot erzeugen.
- Statuswechsel laufen ausschließlich über die geschützte Admin-API. Die
  zugrunde liegende RPC aktualisiert Anfrage und Audit-Eintrag atomar.
- Audit-Einträge und Berechnungssnapshots dürfen nicht aktualisiert, aber im Rahmen
  einer vollständigen Löschung der Kundenanfrage weiterhin kaskadierend
  entfernt werden.

## 5. Verifikation

`supabase/verify-setup.sql` prüft lesend:

- alle Kern- und Workflow-Tabellen mit RLS;
- Admin- und Storage-Policies;
- `document_facts.fact_metadata`;
- `document_analysis_runs.is_current` und die partielle Unique-Constraint;
- Review-, Completion- und Immutable-Funktionen/Trigger;
- die servereigene Status-RPC sowie Tabelle, Policy und Immutable-Trigger der
  Statushistorie;
- doppelte Current Runs;
- privaten `documents`-Bucket;
- konfigurierte Admins.

Die Abfrage für doppelte Current Runs muss keine Zeile liefern.

Danach lokal:

```powershell
npm.cmd run dev
```

Folgende Abläufe manuell testen:

1. `/admin` Login und Passwort-Reset.
2. Anfrage ohne und mit privatem PDF absenden.
3. Anfrage aus dem Dashboard über `/admin/anfragen/[id]` öffnen, die Detail-URL
   aktualisieren und per Browser-Zurück zum erhaltenen Filterzustand wechseln.
4. Status ändern und den neuen Eintrag im Tab `Verlauf` kontrollieren.
5. Analyse starten und eine Angabe akzeptieren, bearbeiten und ablehnen.
6. Widerspruch prüfen und Rechenvorschau öffnen.
7. Testanfrage löschen und die Kaskadenlöschung kontrollieren.

## 6. Vor dem Produktivstart

- Änderungen zuerst auf einem leeren Testprojekt und danach gegen einen
  Production-Schema-Dump validieren.
- Erst nach separater SQL-Freigabe auf Production migrieren.
- Supabase-, OpenAI- und Resend-Secrets in Vercel setzen.
- Keine Secrets mit `NEXT_PUBLIC_` benennen.
- RLS niemals zur Fehlerbehebung deaktivieren.
- Resend-Domain und Supabase Auth-URLs für die Produktionsdomain freigeben.
