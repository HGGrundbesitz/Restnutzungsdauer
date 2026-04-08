# Supabase Team Auth Setup

## Environment variables

Set these values in `.env.local` and in production later:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=RND Gutachten
CONTACT_EMAIL=contact@example.com
GEMINI_API_KEY=
```

Notes:
- The public site and admin login still use the anon key in the browser.
- Internal request notifications go to `CONTACT_EMAIL`.
- Result PDFs are sent as an email attachment (no Supabase server key needed).

## Redirect URLs

Add these in Supabase Auth redirect URLs:

```text
http://localhost:3000/admin/reset-password
http://localhost:3001/admin/reset-password
https://your-domain.com/admin/reset-password
```

## Admin access

Anyone who can log in with Supabase Auth can open `/admin` and see the shared dashboard data.

That means:
- landing-page requests are stored in Supabase
- the admin reads the same Supabase tables directly
- no extra email allowlist or `admin_users` entry is required for basic admin access

## SQL

Run the full contents of [supabase-schema.sql](/c:/Users/josef/Desktop/Restnutzungsdauer/supabase-schema.sql) in the Supabase SQL editor.

That sets up:
- `property_requests`
- `admin_users`
- shared RLS policies for authenticated admin access
- public uploads only for the `requests/` folder
- document access for authenticated admin users

## Current auth flow

The admin now uses a simple flow:
- email/password login
- "Passwort vergessen?" sends a reset link by email
- the new password is set on `/admin/reset-password`
