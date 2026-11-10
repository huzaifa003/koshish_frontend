# Koshish — fundraising & transparent impact

A Next.js App Router application with React, TypeScript, shadcn/ui, Tailwind, and hosted Supabase (Postgres, Auth, Storage). Pages and form endpoints run in the same Next.js app; no separate server is needed.

## Start locally

Use Node.js 22.18+ (Node 24 recommended for the test runner).

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and fill in your hosted Supabase values.
3. Run `npm run dev`, then open http://localhost:3000.

Without the public Supabase variables, pages use clearly labelled sample records. Demo admin edits last only for the session, and public forms explicitly refuse to send requests in preview mode. No real payment is collected by the inquiry form.

## Connect hosted Supabase

For a **new database**, run `supabase/schema.sql` in the Supabase SQL editor. It includes all final tables, indexes, policies, functions, and evidence buckets. Optionally run `supabase/seed.sql` for sample data in a development database only.

For an **existing installation of this repository**, run `supabase/migrations/202611090001_fundraising_privacy.sql`, then `supabase/migrations/202611100001_whatsapp_manual.sql`, in that order. This removes the old public transaction view and public transaction access, adds aggregate reporting and inquiries, and preserves existing records. Back up the database first. Do not reseed a live database.

1. In Supabase Authentication, create the first administrator using an email and password.
2. Copy the user UUID, then run:

```sql
insert into public.user_roles(user_id, email, role)
values ('YOUR-AUTH-USER-UUID', 'admin@example.org', 'admin');
```

3. Fill in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: your hosted project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable/anon key.
   - `SUPABASE_SECRET_KEY`: server-only secret API key (`sb_secret_...`) from Supabase Project Settings → API Keys, used for public inquiry submissions. Never prefix it with NEXT_PUBLIC or expose it to client code.
   - Optionally configure both Turnstile keys for bot protection; register your domain and localhost in Turnstile. The server verifies tokens if its secret is set. Use bot protection and your host’s request limits before opening public forms to traffic.
4. Restart the app and sign in at `/internal`.
5. Add subsequent users in Supabase Auth, then assign their roles in **Team & settings**.

The hosted connection and migration must be applied by you; this checkout contains no hosted project credentials.

## Public experience

- **/**: mission first, impact summary, ongoing campaigns, clear next steps.
- **/campaigns**: status filters, search, accessible project dialogs, goals, progress, and project-specific contribution links.
- **/transparency**: verified project donations, spending, available balances, expenditure shares, summary CSV export, and approved evidence.
- **/contribute**: separate Donate, Volunteer, and Contact tabs. Donation inquiries capture interest and an amount in PKR; administrators follow up with payment instructions. Inquiries never increase donation totals.
- **/internal**: role-protected operations and an admin inbox with request status tracking.

A custom HTTPS donation destination can be set in Team & settings. It appears as an optional external donation link on the Donate tab. The primary flow remains the guided inquiry. Payment provider integrations and automated receipts are not implemented.

## Data and access model

- `projects`: missions, lifecycle status, funding goals, location, reported reach.
- `donations` and `expenses`: individual records readable/writable only by admins through RLS. Anonymous users have no table privileges. Editors cannot read or write transactions.
- `public_project_finances()`: a narrow, parameter-free aggregate RPC. It returns project ID, verified donations, verified expenses, and donation count, including a separate general fund. It returns no donor names, references, dates, or individual amounts. Aggregation occurs in Postgres, independent of API row limits.
- `evidence`: public-approved reports and private supporting files with separate storage buckets. Review/redact documents before approving public visibility.
- `user_roles`: editors maintain projects/evidence; admins also manage transactions, inbox, roles, settings, and deletion.
- `inquiries`: private donation inquiries, volunteer interest, and contact requests. Only admins can read/update them; only the server submission RPC can create them through the public flow.
- `inquiry_rate_limits`: private, durable counters; the submission RPC atomically limits each normalized email hash to five requests per hour across app instances. Turnstile can additionally stop address-rotation abuse. Old counters may be pruned periodically after their one-hour window.

Inputs are validated in Next.js; submissions also use a honeypot, same-origin checks, payload limits, consent recording, and optional Turnstile. A successful request means saved in Supabase; it does not send an email notification. Administrators review the inbox and follow up independently.

Financial history prevents project deletion when transactions reference it. Mark old projects completed instead. Money uses fixed precision numeric fields. Indexed project foreign keys and partial verified-record indexes support aggregate reporting. Admin transaction loading uses cursor batches to avoid Supabase’s default row cap; very large admin ledgers should move to server pagination. The inbox currently shows the latest 200 requests.

All amounts use PKR. Financial totals include verified records only. Available balance is donations minus expenses; it is not an audited bank balance. Fundraising progress is not delivery progress. Project reach can include repeat support and is not a count of unique people.

## Validate

```bash
npm test
npm run typecheck
npm run build
```

Tests run the SQL schema and upgrade against local PostgreSQL via PGlite, check anonymous/editor/admin access, aggregate reconciliation, inquiry privacy, durable rate limits, historical references, and form validation. No hosted credentials are required. These local checks do not replace testing your hosted Supabase configuration and Storage permissions.

## Deploy

Import the repository into Vercel as **Next.js**, add the same environment variables, and use the default Next.js build/output settings. Do not use the old Vite `dist` output or SPA rewrites. Add the production domain in Supabase Auth URL configuration. Run the SQL setup before switching the app to live credentials.

Supabase’s official `supabase-postgres-best-practices` agent skill was installed into the local Codex skills directory; it is available starting with the next chat turn. Source: https://github.com/supabase/agent-skills.

## Visual identity

The interface uses ink navy (#172B36) for structure and financial information, brick (#A5412A) for donation actions, warm ivory (#F8F6F1) for the page, sandstone (#EEE8DD) for supporting surfaces, and slate (#53636B) for secondary text. Pale gold (#E9BC73) is reserved for highlights on navy surfaces.

The central CSS tokens live in src/index.css and are exposed as brand colors in tailwind.config.js. shadcn controls inherit the same semantic tokens, including neutral hover fills and visible keyboard focus. Editorial serif headings pair with sans-serif body copy and financial figures. Project artwork uses a single restrained palette rather than arbitrary colors per card.

## Direct donations and WhatsApp

The Donate tab prioritizes Easypaisa / SadaPay account **Mobeen Ahmed Faheem**, local number **0323-8999-060**, international **+92 323 8999060**, as supplied in the account reference image. Visitors can copy the local number, call the same number, or open WhatsApp to share transfer confirmation and project allocation. The website does not process or automatically verify transfers.

Set a group invite in **Internal → Team & settings → WhatsApp group invite URL**. Only HTTPS chat.whatsapp.com invites are accepted. Without an invite, the site offers an honest **Ask to join** message to the team.

Existing databases must also run `supabase/migrations/202611100001_whatsapp_manual.sql` after the fundraising privacy migration. New installations can run the complete `supabase/schema.sql` instead. The new columns store an admin-only donor WhatsApp number, messaging opt-in, a server-stamped consent date, and the public group invite URL. Public aggregate reporting does not return donor contact information.

When an admin saves a **verified** donation with a valid donor number and recorded permission, the form offers a personalized thank-you draft. The same draft is available from the speech-bubble action on the donation row. The admin reviews it and opens WhatsApp to send manually; opening a draft is never labelled as sent or delivered. Changing the number in the form clears the permission checkbox. Preview mode cannot open donor drafts in WhatsApp. No WhatsApp Business API credentials, automated sending, or delivery tracking are required for this version.

## Bilingual public design

The public interface now uses a custom shared-hope mark, an English/Urdu wordmark, deep green (#173E35), warm white (#FCFBF7), and saffron (#E4B45F). Locally served Fontsource packages provide DM Sans, Lora, Noto Sans Arabic, and Noto Nastaliq Urdu. English and Urdu can be selected in the header; the preference persists on the device. Urdu navigation, donation guidance, forms, and report labels use RTL layout. Project descriptions and supporting documents remain in the language supplied by the team. Account names, phone numbers, and financial values are preserved without translation.

Brand assets are in `public/brand/`: `koshish-mark.svg` is the standalone symbol, and `koshish-bilingual.svg` is the portable bilingual lockup with embedded open-source fonts. The community-care illustration is decorative, not a photograph or evidence of a completed project. shadcn/Radix controls provide the mobile sheet, dialogs, tabs, and form elements; donation and WhatsApp flows keep their existing validation and permissions.
