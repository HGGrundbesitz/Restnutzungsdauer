# MVP Roadmap & Implementation Plan

## 📊 Current Status vs. MVP Requirements

### 1. Landing Page: ✅ DONE
We have built a modern, trustworthy, and fast landing page that explains the service, highlights the tax benefits, and includes clear CTAs.

### 2. Upload & Anfrage-Flow: ✅ DONE
We have the UI for the form (`RequestForm.tsx`), text data insertion, and secure file uploads to Supabase Storage.

### 3. Backend / Admin: ✅ DONE
We built a premium, secure internal view to list requests, download documents, and manage statuses.

### 4. Ergebnis-Auslieferung: ❌ NOT STARTED
We need a simple way to notify the user (e.g., an automated confirmation email when they submit).

---

## 🚀 Step-by-Step Implementation Plan

### Phase 1: Complete the Upload & Anfrage-Flow: ✅ DONE
**Goal:** Allow users to upload documents securely and link them to their database record.
- [x] **Supabase Storage Setup:** Create a secure storage bucket in Supabase for user documents.
- [x] **File Upload Logic:** Update `RequestForm.tsx` to handle file selection and upload the files to the Supabase bucket.
- [x] **Database Linking:** Save the returned file URLs/paths into the `property_requests` table alongside the user's name, email, and property details.
- [x] **Validation & UX:** Add file size limits (max 50 MB), allowed file types (PDF, JPG, PNG), and progress indicators during upload.

### Phase 2: Backend / Admin Dashboard: ✅ DONE
**Goal:** Create a secure internal dashboard to manage incoming requests.
- [x] **Admin Authentication:** Set up Supabase Auth (email/password) to restrict access to the admin dashboard.
- [x] **Admin Layout & Routing:** Create a protected `/admin` route in Next.js.
- [x] **Requests Table:** Build a UI to fetch and display all entries from the `property_requests` table.
- [x] **Request Details & Downloads:** Allow admins to click on a request to view details and download the attached documents.
- [x] **Status Management:** Add a dropdown/toggle to update the status of a request (`eingegangen`, `in Bearbeitung`, `fertig`).

### Phase 3: Ergebnis-Auslieferung (Automated Emails)
**Goal:** Keep the user informed automatically.
- [ ] **Email Provider Integration:** Integrate a transactional email service (e.g., Resend, SendGrid) via Next.js API routes or Supabase Edge Functions.
- [ ] **Confirmation Email:** Send an automated "Thank you for your request, we are reviewing your documents" email immediately after successful form submission.
- [ ] **Admin Notification (Optional):** Send a quick alert to the admin email when a new request is submitted.

### Phase 4: Polish & Launch
**Goal:** Ensure everything is robust and ready for real users.
- [ ] **End-to-End Testing:** Test the entire flow from landing page -> upload -> admin dashboard -> status update.
- [ ] **Security Review:** Ensure Supabase Row Level Security (RLS) policies are strict (users can only insert, admins can read/update).
- [ ] **Deployment:** Verify all environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Email API keys) are correctly set in the production environment.
