# Koshish — Open Impact Ledger

A two-sided charity transparency portal: a public impact dashboard and a role-protected internal workspace. Built with React, TypeScript, Vite, Tailwind, Supabase Postgres/Auth/Storage, and Vercel-ready SPA configuration.

## What is included

- Public verified totals, annual cash-flow charts, source and expense breakdowns
- Expandable project index with project-level reconciliation and impact figures
- Searchable/filterable donation and expense ledger with CSV export
- Public evidence viewer with privacy-conscious document presentation
- Supabase email/password login and admin/editor role enforcement
- Project, donation, expense, evidence, team-role and portal-settings management
- Public and private evidence buckets; 10 MB JPG/PNG/WebP/PDF upload validation
- Anonymous donor display unless public-name consent is explicitly recorded
- Row-level security policies for public reads, team writes and admin-only deletion

## Run the preview

```bash
npm install
npm run dev
```

Without Supabase environment variables, the app intentionally runs in labelled sample mode. Use **Explore the demo workspace** on the internal page. Sample changes are session-only and are never represented as permanent database saves.

## Connect Supabase

1. Create a free Supabase project.
2. In the SQL editor, run `supabase/schema.sql`. This creates tables, indexes, RLS policies, helper functions, settings, and both evidence buckets.
3. Optionally run `supabase/seed.sql` to insert clearly labelled sample records. Do not use the seed in a production database containing real records.
4. In **Authentication → Users**, create your first administrator with an email and password.
5. Copy that user's UUID and run this in the SQL editor, replacing the values:

```sql
insert into public.user_roles (user_id, email, role)
values ('PASTE-USER-UUID', 'you@example.org', 'admin');
```

6. Create `.env.local` from `.env.example` and enter the project URL and **anon/publishable** key. Never expose the `service_role` key in browser code.
7. Restart `npm run dev`. The interface will switch from sample mode to the live Supabase workspace.

Additional team members must first exist in Supabase Authentication. An admin can then assign their UUID and role under **Internal → Team & settings**.

## Deploy to Vercel

1. Push the project to a Git repository and import it in Vercel.
2. Keep the detected Vite settings: build command `npm run build`, output directory `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel's Environment Variables settings.
4. Deploy. `vercel.json` preserves the `/internal` route on refresh.
5. In Supabase **Authentication → URL Configuration**, add the Vercel domain to Site URL / redirect URLs as needed for your auth flow.

Vercel and Supabase free-tier availability and limits are controlled by those providers and can change; review their current limits before launch.

## Before using real charity data

- Replace the sample donation and Instagram URLs in **Team & settings**.
- Import only reconciled historical records and mark each one verified when checked.
- Remove recipient identities, addresses, bank details and other sensitive information from public evidence.
- Keep internal-only documents in the internal evidence bucket.
- Test admin and editor permissions with separate accounts.
- Take a database backup before bulk imports or destructive changes.

## Production checks

```bash
npm run build
npm run lint
```
