-- Apply after SUPABASE_FULL_SCHEMA.sql. Review in a test Supabase project first.
begin;

alter table public.profiles add column if not exists account_status text not null default 'approved'
  check (account_status in ('approved', 'pending', 'disabled'));
alter table public.profiles add column if not exists expo_push_token text;
alter table public.notifications add column if not exists source_key text unique;

create or replace function public.is_active_account(p_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = p_user_id and account_status = 'approved'); $$;

-- Restrictive policies apply alongside the existing ownership/audience policies.
do $$
declare table_name text;
begin
  foreach table_name in array array['events', 'event_registrations', 'event_bookmarks', 'announcements', 'notifications', 'user_settings'] loop
    execute format('drop policy if exists approved_account_required on public.%I', table_name);
    execute format('create policy approved_account_required on public.%I as restrictive for all to authenticated using (public.is_active_account(auth.uid())) with check (public.is_active_account(auth.uid()))', table_name);
  end loop;
end;
$$;

create or replace function public.can_administer(p_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a join public.profiles p on p.id = a.id
    where a.id = p_user_id and a.role in ('superadmin', 'moderator') and p.account_status = 'approved'
  );
$$;

create or replace function public.is_staff(p_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p where p.id = p_user_id
    and p.account_status = 'approved'
    and (p.account_type in ('staff', 'organizer') or public.can_administer(p_user_id))
  );
$$;

-- Users can edit their personal information, but cannot approve or promote themselves.
create or replace function public.protect_profile_authority()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.can_administer(auth.uid()) then
    if tg_op = 'INSERT' then
      if new.account_type not in ('student', 'staff', 'organizer') then
        raise exception 'Invalid account type';
      end if;
      new.account_status := case when new.account_type = 'student' then 'approved' else 'pending' end;
    elsif new.account_type is distinct from old.account_type or new.account_status is distinct from old.account_status then
      raise exception 'Only an administrator can change account authority';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists protect_profile_authority on public.profiles;
create trigger protect_profile_authority before insert or update on public.profiles
for each row execute function public.protect_profile_authority();

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
using (id = auth.uid() or public.can_administer(auth.uid()))
with check (id = auth.uid() or public.can_administer(auth.uid()));

drop policy if exists events_update_staff_owner on public.events;
create policy events_update_staff_owner on public.events for update to authenticated
using ((created_by = auth.uid() and public.is_staff(auth.uid())) or public.can_administer(auth.uid()))
with check ((created_by = auth.uid() and public.is_staff(auth.uid())) or public.can_administer(auth.uid()));

drop policy if exists events_delete_staff_owner on public.events;
create policy events_delete_staff_owner on public.events for delete to authenticated
using ((created_by = auth.uid() and public.is_staff(auth.uid())) or public.can_administer(auth.uid()));

drop policy if exists events_select_visible on public.events;
create policy events_select_visible on public.events for select to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.account_status = 'approved')
  and (created_by = auth.uid() or public.can_administer(auth.uid()) or
    (status = 'published' and (target_audience = 'all' or
      exists (select 1 from public.profiles p where p.id = auth.uid() and
        ((target_audience = 'students' and p.account_type = 'student') or
         (target_audience = 'staff' and p.account_type in ('staff', 'organizer', 'admin')))))))
);

-- Capacity decisions must count all RSVPs, including rows hidden from the attendee.
alter function public.handle_event_registration_rules() security definer;
alter function public.handle_event_registration_rules() set search_path = public;

drop policy if exists event_registrations_select_admin on public.event_registrations;
create policy event_registrations_select_admin on public.event_registrations for select to authenticated
using (public.can_administer(auth.uid()));

commit;
