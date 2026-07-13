# Supabase-Neuprojekt für RND Gutachten

Diese Anleitung richtet das neue Supabase-Projekt für QuickCheck, Admin-Dashboard, Auth, private PDF-Dateien und die OpenAI-Dokumentanalyse ein.

## 1. Umgebungsvariablen

In `.env.local` eintragen. Werte niemals in Git committen oder in Chats posten.

```env
SUPABASE_URL=https://DEIN-PROJECT-REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_JWKS_URL=https://DEIN-PROJECT-REF.supabase.co/auth/v1/.well-known/jwks.json

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4-mini

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=anfragen@deine-domain.de
RESEND_FROM_NAME=RND Gutachten
CONTACT_EMAIL=team@deine-domain.de
```

`SUPABASE_PUBLISHABLE_KEY` darf im Browser verwendet werden. `SUPABASE_SECRET_KEY`, `OPENAI_API_KEY` und `RESEND_API_KEY` sind ausschließlich serverseitig. `SUPABASE_JWKS_URL` wird von der aktuellen App nicht direkt benötigt; Supabase validiert Admin-Tokens selbst. Sie kann für spätere direkte JWT-Prüfungen stehen bleiben.

Nach jeder Änderung an `.env.local` den Dev-Server komplett neu starten.

## 2. Tabellen, RLS und Storage anlegen

1. Im Supabase Dashboard das neue Projekt öffnen.
2. `SQL Editor` öffnen.
3. Den gesamten Inhalt von `supabase-schema.sql` einfügen.
4. `Run` ausführen.
5. Danach den gesamten Inhalt von `supabase/migrations/20260712180000_document_review_workflow.sql` einfügen.
6. Erneut `Run` ausführen.

Das Script erstellt:

- `property_requests` für Anfragen
- `rnd_estimates` für das serverseitige Rechenprotokoll
- `admin_users` als explizite Admin-Freigabeliste
- `document_analysis_runs` für versionierte Dokumentprüfungen
- `document_facts` für belegte Angaben mit PDF-Seite und Textstelle
- `document_conflicts` für deterministisch erkannte Widersprüche
- `document_fact_audit_log` für Prüfentscheidungen
- `rnd_calculation_snapshots` für freigegebene Neuberechnungen
- `report_drafts` als vorbereitete, noch nicht aktive Basis für spätere Berichtsentwürfe
- den privaten Storage-Bucket `documents`
- Indizes, Constraints und RLS-Policies

Es gibt absichtlich keine öffentliche Insert-Policy. Das Formular speichert über die abgesicherte Next.js-Serverroute mit dem Secret Key. Im Browser sind Kundendaten nicht öffentlich lesbar.

## 3. Supabase Auth konfigurieren

Unter `Authentication`:

1. E-Mail/Passwort aktivieren.
2. Öffentliche Registrierungen deaktivieren. Admin-Konten werden nur manuell angelegt.
3. Mindestlänge für Passwörter auf mindestens 10, besser 12 Zeichen setzen.
4. Anonyme Logins deaktiviert lassen.
5. JWT-Laufzeit kurz halten; 3600 Sekunden ist für dieses Dashboard passend.
6. Für Produktion einen eigenen SMTP-Dienst konfigurieren, damit Passwort-Reset-E-Mails zuverlässig ankommen.

URL-Konfiguration während der lokalen Entwicklung:

```text
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/admin/reset-password
```

Nach dem Domain-Launch zusätzlich eintragen:

```text
https://DEINE-DOMAIN.DE
https://DEINE-DOMAIN.DE/admin/reset-password
```

## 4. Ersten Admin anlegen

1. `Authentication -> Users -> Add user` öffnen.
2. E-Mail und starkes Passwort anlegen; E-Mail bestätigen.
3. `supabase/add-admin.sql` öffnen.
4. `ADMIN_EMAIL_HIER_EINTRAGEN` durch genau diese E-Mail ersetzen.
5. Script im SQL Editor ausführen.

Nur ein Auth-Benutzer mit aktivem Eintrag in `admin_users` darf Anfragen und Dokumente sehen. Ein normal eingeloggter Benutzer erhält keinen Dashboard-Zugriff.

Weitere Admins werden genauso angelegt. Zum Sperren eines Admins:

```sql
update public.admin_users
set active = false
where email = lower('admin@beispiel.de');
```

## 5. E-Mail und Passwort-Reset

Die App verwendet Resend für QuickCheck-Bestätigungen. Der Supabase-Passwort-Reset benötigt zusätzlich eine SMTP-Konfiguration im Supabase-Dashboard. Für Produktion muss `RESEND_FROM_EMAIL` zu einer bei Resend verifizierten Domain gehören; `onboarding@resend.dev` ist nur zum Testen geeignet.

## 6. OpenAI-Dokumentanalyse

Die Analyse und fachliche Prüfung laufen über geschützte Admin-Routen:

- nur ein gültig eingeloggter und freigeschalteter Admin darf sie aufrufen
- PDFs kommen aus dem privaten Supabase-Bucket
- maximal 15 MB, PDF-Signatur und erlaubter Pfad werden geprüft
- Dokumentinhalt wird als nicht vertrauenswürdig behandelt
- `store: false` verhindert das Speichern der Antwort über die API-Anfrage
- die KI berechnet keine Restnutzungsdauer und gibt keine Steuer- oder Rechtsentscheidung ab
- erkannte Angaben werden mit Datei, Seite und Textbeleg gespeichert
- kein erkannter Wert wird automatisch übernommen
- nur übernommene oder bearbeitete Werte können in eine neue deterministische Berechnung einfließen
- widersprüchliche Werte werden nicht stillschweigend ausgewählt

Für die OpenAI API muss im OpenAI Platform-Konto Billing/Guthaben aktiv sein. Der ChatGPT-Plan allein enthält kein API-Guthaben.

## 7. Setup kontrollieren

Den Inhalt von `supabase/verify-setup.sql` im SQL Editor ausführen. Erwartet werden:

- alle Kern- und Prüf-Tabellen mit `rowsecurity = true`
- Admin-Policies für Tabellen und Storage
- Bucket `documents` mit `public = false`
- mindestens ein aktiver Admin

Danach lokal:

```powershell
npm run dev
```

Diese Abläufe testen:

1. `/admin` Login
2. Passwort-Reset per E-Mail
3. QuickCheck ohne PDF absenden
4. QuickCheck mit PDF absenden
5. Anfrage und PDF im Dashboard öffnen
6. Status ändern und Seite neu laden
7. Dokumentprüfung eines Test-PDFs starten
8. Eine Angabe übernehmen, bearbeiten und ablehnen
9. Einen Test-Widerspruch prüfen und die Rechenvorschau öffnen
10. Testanfrage wieder löschen und prüfen, dass Fakten und Prüfstände mit gelöscht wurden

## 8. Vor dem Produktivstart

- Supabase Pro verwenden, damit das Projekt nicht wegen Inaktivität pausiert.
- Supabase-, OpenAI- und Resend-Secrets auch in Vercel eintragen.
- Produktionsdomain bei Supabase Auth und Resend konfigurieren.
- Keine Secrets mit `NEXT_PUBLIC_` benennen.
- RLS niemals deaktivieren, um einen Fehler kurzfristig zu umgehen.
- Optional Cloudflare Turnstile vor öffentliche Uploads/Formulare setzen, um Bot-Missbrauch stärker zu begrenzen.
