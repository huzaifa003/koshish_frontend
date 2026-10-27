-- Koshish portal: run once in the Supabase SQL editor.
-- Uses only the publishable browser key in the app; never expose service_role.

create extension if not exists pgcrypto;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'planned')),
  location text not null,
  started_on date not null,
  summary text not null,
  description text not null,
  goal_amount numeric(14,2) not null default 0 check (goal_amount >= 0),
  beneficiaries integer not null default 0 check (beneficiaries >= 0),
  art text not null default 'ration' check (art in ('ration', 'education', 'health', 'winter', 'water', 'recovery')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  received_on date not null,
  amount numeric(14,2) not null check (amount > 0),
  donor_name text not null default '',
  is_name_public boolean not null default false,
  source text not null,
  method text not null,
  project_id uuid references public.projects(id) on delete set null,
  reference text not null,
  verified boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  spent_on date not null,
  amount numeric(14,2) not null check (amount > 0),
  category text not null,
  vendor text not null,
  description text not null,
  project_id uuid references public.projects(id) on delete set null,
  reference text not null,
  verified boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  expense_id uuid references public.expenses(id) on delete set null,
  title text not null,
  description text not null default '',
  storage_path text,
  bucket text check (bucket in ('public-evidence', 'internal-evidence')),
  public_url text,
  mime_type text not null,
  visibility text not null default 'internal' check (visibility in ('public', 'internal')),
  captured_on date not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key,
  donation_url text not null,
  instagram_url text not null,
  tagline text not null,
  updated_at timestamptz not null default now()
);

create index if not exists donations_date_idx on public.donations(received_on desc);
create index if not exists donations_project_idx on public.donations(project_id);
create index if not exists expenses_date_idx on public.expenses(spent_on desc);
create index if not exists expenses_project_idx on public.expenses(project_id);
create index if not exists evidence_project_idx on public.evidence(project_id);
create index if not exists evidence_expense_idx on public.evidence(expense_id);

create or replace function public.is_team_member()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = (select auth.uid())); $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = (select auth.uid()) and role = 'admin'); $$;

revoke all on function public.is_team_member() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_team_member() to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.user_roles enable row level security;
alter table public.projects enable row level security;
alter table public.donations enable row level security;
alter table public.expenses enable row level security;
alter table public.evidence enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "roles_read_self_or_admin" on public.user_roles;
create policy "roles_read_self_or_admin" on public.user_roles for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
drop policy if exists "roles_admin_insert" on public.user_roles;
create policy "roles_admin_insert" on public.user_roles for insert to authenticated with check (public.is_admin());
drop policy if exists "roles_admin_update" on public.user_roles;
create policy "roles_admin_update" on public.user_roles for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "roles_admin_delete" on public.user_roles;
create policy "roles_admin_delete" on public.user_roles for delete to authenticated using (public.is_admin());

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects for select to anon, authenticated using (true);
drop policy if exists "projects_team_insert" on public.projects;
create policy "projects_team_insert" on public.projects for insert to authenticated with check (public.is_team_member());
drop policy if exists "projects_team_update" on public.projects;
create policy "projects_team_update" on public.projects for update to authenticated using (public.is_team_member()) with check (public.is_team_member());
drop policy if exists "projects_admin_delete" on public.projects;
create policy "projects_admin_delete" on public.projects for delete to authenticated using (public.is_admin());

-- No anonymous SELECT policy on the base donations table: private donor names
-- are exposed only through the verified, public-safe view below.
drop policy if exists "donations_public_verified" on public.donations;
drop policy if exists "donations_team_read" on public.donations;
create policy "donations_team_read" on public.donations for select to authenticated using (public.is_team_member());
drop policy if exists "donations_team_insert" on public.donations;
create policy "donations_team_insert" on public.donations for insert to authenticated with check (public.is_team_member());
drop policy if exists "donations_team_update" on public.donations;
create policy "donations_team_update" on public.donations for update to authenticated using (public.is_team_member()) with check (public.is_team_member());
drop policy if exists "donations_admin_delete" on public.donations;
create policy "donations_admin_delete" on public.donations for delete to authenticated using (public.is_admin());

create or replace view public.public_donations as
select id, received_on, amount,
  case when is_name_public then donor_name else '' end as donor_name,
  is_name_public, source, method, project_id, reference, verified, created_at
from public.donations
where verified = true;
revoke all on public.public_donations from public;
grant select on public.public_donations to anon, authenticated;

drop policy if exists "expenses_public_verified" on public.expenses;
create policy "expenses_public_verified" on public.expenses for select to anon, authenticated using (verified = true);
drop policy if exists "expenses_team_read" on public.expenses;
create policy "expenses_team_read" on public.expenses for select to authenticated using (public.is_team_member());
drop policy if exists "expenses_team_insert" on public.expenses;
create policy "expenses_team_insert" on public.expenses for insert to authenticated with check (public.is_team_member());
drop policy if exists "expenses_team_update" on public.expenses;
create policy "expenses_team_update" on public.expenses for update to authenticated using (public.is_team_member()) with check (public.is_team_member());
drop policy if exists "expenses_admin_delete" on public.expenses;
create policy "expenses_admin_delete" on public.expenses for delete to authenticated using (public.is_admin());

drop policy if exists "evidence_public_read" on public.evidence;
create policy "evidence_public_read" on public.evidence for select to anon, authenticated using (visibility = 'public');
drop policy if exists "evidence_team_read" on public.evidence;
create policy "evidence_team_read" on public.evidence for select to authenticated using (public.is_team_member());
drop policy if exists "evidence_team_insert" on public.evidence;
create policy "evidence_team_insert" on public.evidence for insert to authenticated with check (public.is_team_member());
drop policy if exists "evidence_team_update" on public.evidence;
create policy "evidence_team_update" on public.evidence for update to authenticated using (public.is_team_member()) with check (public.is_team_member());
drop policy if exists "evidence_admin_delete" on public.evidence;
create policy "evidence_admin_delete" on public.evidence for delete to authenticated using (public.is_admin());

drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "settings_admin_insert" on public.site_settings;
create policy "settings_admin_insert" on public.site_settings for insert to authenticated with check (public.is_admin());
drop policy if exists "settings_admin_update" on public.site_settings;
create policy "settings_admin_update" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "settings_admin_delete" on public.site_settings;
create policy "settings_admin_delete" on public.site_settings for delete to authenticated using (public.is_admin());

insert into storage.buckets (id, name, public) values
  ('public-evidence', 'public-evidence', true),
  ('internal-evidence', 'internal-evidence', false)
on conflict (id) do nothing;

drop policy if exists "koshish_public_evidence_read" on storage.objects;
create policy "koshish_public_evidence_read" on storage.objects for select to anon, authenticated using (bucket_id = 'public-evidence');
drop policy if exists "koshish_internal_evidence_read" on storage.objects;
create policy "koshish_internal_evidence_read" on storage.objects for select to authenticated using (bucket_id = 'internal-evidence' and public.is_team_member());
drop policy if exists "koshish_team_evidence_upload" on storage.objects;
create policy "koshish_team_evidence_upload" on storage.objects for insert to authenticated with check (bucket_id in ('public-evidence', 'internal-evidence') and public.is_team_member());
drop policy if exists "koshish_team_evidence_update" on storage.objects;
create policy "koshish_team_evidence_update" on storage.objects for update to authenticated using (bucket_id in ('public-evidence', 'internal-evidence') and public.is_team_member()) with check (bucket_id in ('public-evidence', 'internal-evidence') and public.is_team_member());
drop policy if exists "koshish_admin_evidence_delete" on storage.objects;
create policy "koshish_admin_evidence_delete" on storage.objects for delete to authenticated using (bucket_id in ('public-evidence', 'internal-evidence') and public.is_admin());

insert into public.site_settings (id, donation_url, instagram_url, tagline)
values ('main', 'https://www.instagram.com/koshish/', 'https://www.instagram.com/koshish/', 'Small efforts. Clearly accounted for.')
on conflict (id) do nothing;
