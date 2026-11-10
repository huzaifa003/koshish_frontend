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
