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
