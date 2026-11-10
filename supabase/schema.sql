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

-- Financial rows are admin-only; the aggregate RPC is defined below.
drop policy if exists "donations_public_verified" on public.donations;
drop policy if exists "donations_team_read" on public.donations;
drop policy if exists "donations_team_insert" on public.donations;
drop policy if exists "donations_team_update" on public.donations;
drop policy if exists "donations_admin_delete" on public.donations;
create policy "donations_admin_delete" on public.donations for delete to authenticated using (public.is_admin());

-- Individual donations are private. See aggregate RPC below.

drop policy if exists "expenses_public_verified" on public.expenses;
drop policy if exists "expenses_team_read" on public.expenses;
drop policy if exists "expenses_team_insert" on public.expenses;
drop policy if exists "expenses_team_update" on public.expenses;
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
values ('main', 'https://www.instagram.com/kosshissh/', 'https://www.instagram.com/kosshissh/', 'Small efforts. Clearly accounted for.')
on conflict (id) do nothing;


-- Run after the original schema on existing installations. Safe to rerun.
-- No donor identity, reference, date, or individual amount is exposed publicly.
begin;
drop view if exists public.public_donations;
revoke all on public.donations, public.expenses from anon;
revoke all on public.donations, public.expenses from authenticated;
grant select, insert, update, delete on public.donations, public.expenses to authenticated;
drop policy if exists "donations_public_verified" on public.donations;
drop policy if exists "expenses_public_verified" on public.expenses;
drop policy if exists "donations_team_read" on public.donations;
drop policy if exists "donations_team_insert" on public.donations;
drop policy if exists "donations_team_update" on public.donations;
drop policy if exists "expenses_team_read" on public.expenses;
drop policy if exists "expenses_team_insert" on public.expenses;
drop policy if exists "expenses_team_update" on public.expenses;
drop policy if exists "donations_admin_access" on public.donations;
create policy "donations_admin_access" on public.donations for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "expenses_admin_access" on public.expenses;
create policy "expenses_admin_access" on public.expenses for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

-- Deliberate, narrow SECURITY DEFINER boundary: aggregate-only result, no inputs,
-- qualified relations, no dynamic SQL, and an empty search_path.
create or replace function public.public_project_finances()
returns table(project_id uuid, raised numeric, spent numeric, donation_count bigint)
language sql stable security definer set search_path = ''
as $$
 with funds as (select id from public.projects union all select null::uuid),
 incoming as (select d.project_id, sum(d.amount) raised, count(*) donation_count
              from public.donations d where d.verified group by d.project_id),
 outgoing as (select e.project_id, sum(e.amount) spent
              from public.expenses e where e.verified group by e.project_id)
 select f.id, coalesce(i.raised,0), coalesce(o.spent,0), coalesce(i.donation_count,0)
 from funds f left join incoming i on i.project_id is not distinct from f.id
 left join outgoing o on o.project_id is not distinct from f.id;
$$;
revoke all on function public.public_project_finances() from public;
grant execute on function public.public_project_finances() to anon, authenticated;
create index if not exists donations_verified_project_idx on public.donations(project_id) include(amount) where verified;
create index if not exists expenses_verified_project_idx on public.expenses(project_id) include(amount) where verified;
create index if not exists projects_created_by_idx on public.projects(created_by);
create index if not exists donations_created_by_idx on public.donations(created_by);
create index if not exists expenses_created_by_idx on public.expenses(created_by);
create index if not exists evidence_uploaded_by_idx on public.evidence(uploaded_by);

create table if not exists public.inquiries (
 id uuid primary key default gen_random_uuid(),
 kind text not null check (kind in ('donate','volunteer','contact')),
 name text not null check (char_length(name) between 2 and 120),
 email text not null check (char_length(email) between 3 and 254),
 project_id uuid references public.projects(id) on delete set null,
 amount numeric(14,2) check (amount > 0 and amount <= 100000000),
 message text not null check (char_length(message) between 10 and 4000),
 consent_at timestamptz not null default now(),
 status text not null default 'new' check (status in ('new','in_progress','closed')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (kind <> 'donate' or amount is not null)
);
alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
grant select,update,delete on public.inquiries to authenticated;
grant all on public.inquiries to service_role;
drop policy if exists "inquiries_admin_access" on public.inquiries;
create policy "inquiries_admin_access" on public.inquiries for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create index if not exists inquiries_project_idx on public.inquiries(project_id);
create index if not exists inquiries_status_date_idx on public.inquiries(status,created_at desc);

-- Durable, atomic rate limits shared by all Next.js instances.
create table if not exists public.inquiry_rate_limits (
 rate_key text primary key,
 window_started_at timestamptz not null default now(),
 requests integer not null default 1 check (requests > 0)
);
alter table public.inquiry_rate_limits enable row level security;
revoke all on public.inquiry_rate_limits from public,anon,authenticated;
grant all on public.inquiry_rate_limits to service_role;
create or replace function public.submit_inquiry(p_kind text,p_name text,p_email text,
 p_project_id uuid,p_amount numeric,p_message text,p_rate_key text)
returns void language plpgsql security definer set search_path = '' as $$
declare request_count integer;
begin
 insert into public.inquiry_rate_limits as limits(rate_key) values(p_rate_key)
 on conflict (rate_key) do update set
 requests=case when limits.window_started_at < now()-interval '1 hour' then 1 else limits.requests+1 end,
 window_started_at=case when limits.window_started_at < now()-interval '1 hour' then now() else limits.window_started_at end
 returning requests into request_count;
 if request_count > 5 then raise exception 'rate_limit'; end if;
 if p_project_id is not null and not exists(select 1 from public.projects where id=p_project_id and status='active') then
 raise exception 'campaign_unavailable'; end if;
 insert into public.inquiries(kind,name,email,project_id,amount,message)
 values(p_kind,p_name,p_email,p_project_id,p_amount,p_message);
end;
$$;
revoke all on function public.submit_inquiry(text,text,text,uuid,numeric,text,text) from public,anon,authenticated;
grant execute on function public.submit_inquiry(text,text,text,uuid,numeric,text,text) to service_role;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at=now(); return new; end;
$$;
drop trigger if exists touch_inquiries on public.inquiries;
create trigger touch_inquiries before update on public.inquiries for each row execute function public.touch_updated_at();

-- Fix the default social destination only, preserving any custom payment URL.
update public.site_settings set instagram_url='https://www.instagram.com/kosshissh/'
where instagram_url='https://www.instagram.com/koshish/';
update public.site_settings set donation_url='https://www.instagram.com/kosshissh/'
where donation_url='https://www.instagram.com/koshish/';

-- Explicit API grants; row-level policies still enforce all access.
grant select on public.projects, public.evidence, public.site_settings to anon;
grant select,insert,update,delete on public.projects, public.evidence, public.site_settings, public.user_roles to authenticated;

-- Keep historical allocations intact; close projects instead of deleting history.
alter table public.donations drop constraint if exists donations_project_id_fkey;
alter table public.donations add constraint donations_project_id_fkey foreign key(project_id) references public.projects(id) on delete restrict;
alter table public.expenses drop constraint if exists expenses_project_id_fkey;
alter table public.expenses add constraint expenses_project_id_fkey foreign key(project_id) references public.projects(id) on delete restrict;

commit;

-- Manual WhatsApp thanks: donor contacts remain in the admin-only donations table.
begin;
alter table public.site_settings add column if not exists whatsapp_group_url text not null default '';
alter table public.site_settings drop constraint if exists site_settings_whatsapp_group_url_check;
alter table public.site_settings add constraint site_settings_whatsapp_group_url_check
check (whatsapp_group_url = '' or whatsapp_group_url ~ '^https://chat[.]whatsapp[.]com/[A-Za-z0-9_-]{10,128}/?([?].*)?$');

alter table public.donations add column if not exists donor_phone text not null default '';
alter table public.donations add column if not exists whatsapp_opt_in boolean not null default false;
alter table public.donations add column if not exists whatsapp_opt_in_at timestamptz;
alter table public.donations drop constraint if exists donations_donor_phone_check;
alter table public.donations add constraint donations_donor_phone_check check (donor_phone = '' or donor_phone ~ '^[1-9][0-9]{7,14}$');
alter table public.donations drop constraint if exists donations_whatsapp_consent_check;
alter table public.donations add constraint donations_whatsapp_consent_check check (not whatsapp_opt_in or donor_phone <> '');

create or replace function public.record_whatsapp_consent()
returns trigger language plpgsql set search_path = '' as $$
begin
 if not new.whatsapp_opt_in then
   new.whatsapp_opt_in_at = null;
 elsif tg_op = 'INSERT' then
   new.whatsapp_opt_in_at = now();
 elsif not old.whatsapp_opt_in or new.donor_phone is distinct from old.donor_phone then
   new.whatsapp_opt_in_at = now();
 else
   new.whatsapp_opt_in_at = old.whatsapp_opt_in_at;
 end if;
 return new;
end;
$$;
drop trigger if exists record_donation_whatsapp_consent on public.donations;
create trigger record_donation_whatsapp_consent before insert or update on public.donations
for each row execute function public.record_whatsapp_consent();

comment on column public.donations.donor_phone is 'Admin-only WhatsApp recipient; international digits without +. Never expose through public reporting.';
comment on column public.donations.whatsapp_opt_in_at is 'Server timestamp of messaging permission recorded by an administrator. Not a send or delivery receipt.';
commit;
