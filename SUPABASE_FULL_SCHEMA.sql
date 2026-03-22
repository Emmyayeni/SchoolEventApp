-- Full Supabase schema for NSUK Events app (final fixed version)
-- Run this in Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Utility functions
-- ---------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_event_publish_state()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  elsif new.status = 'draft' then
    new.published_at = null;
  end if;

  return new;
end;
$$;

create or replace function public.handle_notification_read_state()
returns trigger
language plpgsql
as $$
begin
  if new.is_read = true and new.read_at is null then
    new.read_at = now();
  elsif new.is_read = false then
    new.read_at = null;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (auth-linked)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  account_type text not null default 'student' check (account_type in ('student', 'staff')),
  department text,
  level text,
  faculty text,
  matric_number text,
  staff_id text,
  role_designation text,
  avatar_url text,
  phone_number text,
  theme_mode text not null default 'system' check (theme_mode in ('light', 'dark', 'system')),
  has_seen_onboarding boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Compatibility migration for existing camelCase/lowercase profiles schema.
-- Run before profile indexes so expected snake_case columns exist.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'accountType'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'account_type'
  ) then
    execute 'alter table public.profiles rename column "accountType" to account_type';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'accounttype'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'account_type'
  ) then
    execute 'alter table public.profiles rename column accounttype to account_type';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'fullName'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name'
  ) then
    execute 'alter table public.profiles rename column "fullName" to full_name';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'fullname'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name'
  ) then
    execute 'alter table public.profiles rename column fullname to full_name';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'matricNumber'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'matric_number'
  ) then
    execute 'alter table public.profiles rename column "matricNumber" to matric_number';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'matricnumber'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'matric_number'
  ) then
    execute 'alter table public.profiles rename column matricnumber to matric_number';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'staffId'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'staff_id'
  ) then
    execute 'alter table public.profiles rename column "staffId" to staff_id';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'staffid'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'staff_id'
  ) then
    execute 'alter table public.profiles rename column staffid to staff_id';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'roleDesignation'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role_designation'
  ) then
    execute 'alter table public.profiles rename column "roleDesignation" to role_designation';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'roledesignation'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role_designation'
  ) then
    execute 'alter table public.profiles rename column roledesignation to role_designation';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_url'
  ) then
    execute 'alter table public.profiles rename column "avatar" to avatar_url';
  end if;
end $$;

create unique index if not exists idx_profiles_matric_number_unique
  on public.profiles (matric_number)
  where matric_number is not null;

create unique index if not exists idx_profiles_staff_id_unique
  on public.profiles (staff_id)
  where staff_id is not null;

create index if not exists idx_profiles_account_type on public.profiles(account_type);
create index if not exists idx_profiles_department on public.profiles(department);

create or replace function public.is_staff(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.account_type = 'staff'
  );
$$;

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text not null,
  event_date date not null,
  start_time time,
  venue text not null,
  organizer text not null,
  image_url text,
  is_featured boolean not null default false,
  target_audience text not null default 'all'
    check (target_audience in ('all', 'students', 'staff')),
  capacity integer,
  status text not null default 'published'
    check (status in ('draft', 'published', 'cancelled', 'archived')),
  created_by uuid not null references public.profiles(id) on delete cascade,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (capacity is null or capacity > 0)
);

create index if not exists idx_events_event_date on public.events(event_date);
create index if not exists idx_events_category on public.events(category);
create index if not exists idx_events_status on public.events(status);
create index if not exists idx_events_created_by on public.events(created_by);
create index if not exists idx_events_featured on public.events(is_featured);

-- ---------------------------------------------------------------------------
-- Registrations (many-to-many users <-> events)
-- ---------------------------------------------------------------------------

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'registered'
    check (status in ('registered', 'cancelled', 'waitlisted')),
  registered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists idx_event_registrations_user_id on public.event_registrations(user_id);
create index if not exists idx_event_registrations_event_id on public.event_registrations(event_id);
create index if not exists idx_event_registrations_status on public.event_registrations(status);

create or replace function public.handle_event_registration_rules()
returns trigger
language plpgsql
as $$
declare
  v_event public.events%rowtype;
  v_registered_count integer;
begin
  if tg_op = 'UPDATE' and old.event_id <> new.event_id then
    raise exception 'Changing event_id is not allowed';
  end if;

  select *
  into v_event
  from public.events
  where id = new.event_id
  for update;

  if not found then
    raise exception 'Event not found';
  end if;

  if v_event.status <> 'published' then
    raise exception 'Cannot register for a non-published event';
  end if;

  if new.status = 'registered' and v_event.capacity is not null then
    select count(*)
    into v_registered_count
    from public.event_registrations er
    where er.event_id = new.event_id
      and er.status = 'registered'
      and (tg_op <> 'UPDATE' or er.id <> old.id);

    if v_registered_count >= v_event.capacity then
      new.status := 'waitlisted';
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Bookmarks / Saved events
-- ---------------------------------------------------------------------------

create table if not exists public.event_bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create index if not exists idx_event_bookmarks_event_id on public.event_bookmarks(event_id);

-- ---------------------------------------------------------------------------
-- Announcements (sent by staff)
-- ---------------------------------------------------------------------------

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  message text not null,
  target_audience text[] not null default array['all'],
  attachment_urls text[] not null default '{}',
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_announcements_sender_id on public.announcements(sender_id);
create index if not exists idx_announcements_sent_at on public.announcements(sent_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'announcements_target_audience_check'
      and conrelid = 'public.announcements'::regclass
  ) then
    alter table public.announcements
      add constraint announcements_target_audience_check
      check (
        coalesce(array_length(target_audience, 1), 0) > 0
        and target_audience <@ array['all', 'students', 'staff']::text[]
      );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Notifications (per user)
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'general'
    check (type in ('general', 'event', 'announcement', 'reminder', 'system')),
  event_id uuid references public.events(id) on delete set null,
  announcement_id uuid references public.announcements(id) on delete set null,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(user_id, is_read);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notifications_read_state_check'
      and conrelid = 'public.notifications'::regclass
  ) then
    alter table public.notifications
      add constraint notifications_read_state_check
      check (
        (is_read = false and read_at is null)
        or
        (is_read = true and read_at is not null)
      );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- User settings
-- ---------------------------------------------------------------------------

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  push_notifications_enabled boolean not null default true,
  email_notifications_enabled boolean not null default true,
  marketing_notifications_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row execute function public.handle_updated_at();

drop trigger if exists set_events_publish_state on public.events;
create trigger set_events_publish_state
before insert or update on public.events
for each row execute function public.handle_event_publish_state();

drop trigger if exists set_event_registrations_updated_at on public.event_registrations;
create trigger set_event_registrations_updated_at
before update on public.event_registrations
for each row execute function public.handle_updated_at();

drop trigger if exists enforce_event_registration_rules on public.event_registrations;
create trigger enforce_event_registration_rules
before insert or update on public.event_registrations
for each row execute function public.handle_event_registration_rules();

drop trigger if exists set_announcements_updated_at on public.announcements;
create trigger set_announcements_updated_at
before update on public.announcements
for each row execute function public.handle_updated_at();

drop trigger if exists set_notifications_updated_at on public.notifications;
create trigger set_notifications_updated_at
before update on public.notifications
for each row execute function public.handle_updated_at();

drop trigger if exists set_notifications_read_state on public.notifications;
create trigger set_notifications_read_state
before insert or update on public.notifications
for each row execute function public.handle_notification_read_state();

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_bookmarks enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;

-- Profiles
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_own_or_staff" on public.profiles;
create policy "profiles_select_own_or_staff"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or public.is_staff((select auth.uid()))
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Events
drop policy if exists "events_select_authenticated" on public.events;
drop policy if exists "events_select_visible" on public.events;
create policy "events_select_visible"
on public.events
for select
to authenticated
using (
  status = 'published'
  or created_by = (select auth.uid())
);

drop policy if exists "events_insert_staff" on public.events;
create policy "events_insert_staff"
on public.events
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.is_staff((select auth.uid()))
);

drop policy if exists "events_update_staff_owner" on public.events;
create policy "events_update_staff_owner"
on public.events
for update
to authenticated
using (
  created_by = (select auth.uid())
  and public.is_staff((select auth.uid()))
)
with check (
  created_by = (select auth.uid())
  and public.is_staff((select auth.uid()))
);

drop policy if exists "events_delete_staff_owner" on public.events;
create policy "events_delete_staff_owner"
on public.events
for delete
to authenticated
using (
  created_by = (select auth.uid())
  and public.is_staff((select auth.uid()))
);

-- Event registrations
drop policy if exists "event_registrations_select_own" on public.event_registrations;
create policy "event_registrations_select_own"
on public.event_registrations
for select
to authenticated
using (
  user_id = (select auth.uid())
);

drop policy if exists "event_registrations_select_event_owner" on public.event_registrations;
create policy "event_registrations_select_event_owner"
on public.event_registrations
for select
to authenticated
using (
  exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.created_by = (select auth.uid())
  )
);

drop policy if exists "event_registrations_insert_own" on public.event_registrations;
create policy "event_registrations_insert_own"
on public.event_registrations
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.status = 'published'
      and (
        e.target_audience = 'all'
        or (
          e.target_audience = 'students'
          and exists (
            select 1
            from public.profiles p
            where p.id = (select auth.uid())
              and p.account_type = 'student'
          )
        )
        or (
          e.target_audience = 'staff'
          and public.is_staff((select auth.uid()))
        )
      )
  )
);

drop policy if exists "event_registrations_update_own" on public.event_registrations;
create policy "event_registrations_update_own"
on public.event_registrations
for update
to authenticated
using (
  user_id = (select auth.uid())
)
with check (
  user_id = (select auth.uid())
);

drop policy if exists "event_registrations_delete_own" on public.event_registrations;
create policy "event_registrations_delete_own"
on public.event_registrations
for delete
to authenticated
using (
  user_id = (select auth.uid())
);

-- Event bookmarks
drop policy if exists "event_bookmarks_select_own" on public.event_bookmarks;
create policy "event_bookmarks_select_own"
on public.event_bookmarks
for select
to authenticated
using (
  user_id = (select auth.uid())
);

drop policy if exists "event_bookmarks_insert_own" on public.event_bookmarks;
create policy "event_bookmarks_insert_own"
on public.event_bookmarks
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.events e
    where e.id = event_id
      and (
        e.status = 'published'
        or e.created_by = (select auth.uid())
      )
  )
);

drop policy if exists "event_bookmarks_delete_own" on public.event_bookmarks;
create policy "event_bookmarks_delete_own"
on public.event_bookmarks
for delete
to authenticated
using (
  user_id = (select auth.uid())
);

-- Announcements
drop policy if exists "announcements_select_authenticated" on public.announcements;
drop policy if exists "announcements_select_visible" on public.announcements;
create policy "announcements_select_visible"
on public.announcements
for select
to authenticated
using (
  sender_id = (select auth.uid())
  or 'all' = any(target_audience)
  or (
    'students' = any(target_audience)
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.account_type = 'student'
    )
  )
  or (
    'staff' = any(target_audience)
    and public.is_staff((select auth.uid()))
  )
);

drop policy if exists "announcements_insert_staff" on public.announcements;
create policy "announcements_insert_staff"
on public.announcements
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and public.is_staff((select auth.uid()))
);

drop policy if exists "announcements_update_staff_owner" on public.announcements;
create policy "announcements_update_staff_owner"
on public.announcements
for update
to authenticated
using (
  sender_id = (select auth.uid())
  and public.is_staff((select auth.uid()))
)
with check (
  sender_id = (select auth.uid())
  and public.is_staff((select auth.uid()))
);

drop policy if exists "announcements_delete_staff_owner" on public.announcements;
create policy "announcements_delete_staff_owner"
on public.announcements
for delete
to authenticated
using (
  sender_id = (select auth.uid())
  and public.is_staff((select auth.uid()))
);

-- Notifications
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (
  user_id = (select auth.uid())
);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (
  user_id = (select auth.uid())
)
with check (
  user_id = (select auth.uid())
);

drop policy if exists "notifications_insert_own" on public.notifications;
-- Intentionally no INSERT policy for authenticated users.
-- Insert notifications from your backend using service_role.

-- User settings
drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
on public.user_settings
for select
to authenticated
using (
  user_id = (select auth.uid())
);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
on public.user_settings
for insert
to authenticated
with check (
  user_id = (select auth.uid())
);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
on public.user_settings
for update
to authenticated
using (
  user_id = (select auth.uid())
)
with check (
  user_id = (select auth.uid())
);

-- ---------------------------------------------------------------------------
-- Optional compatibility migration for existing camelCase profiles schema
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'accountType'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'account_type'
  ) then
    execute 'alter table public.profiles rename column "accountType" to account_type';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'fullName'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name'
  ) then
    execute 'alter table public.profiles rename column "fullName" to full_name';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'matricNumber'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'matric_number'
  ) then
    execute 'alter table public.profiles rename column "matricNumber" to matric_number';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'staffId'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'staff_id'
  ) then
    execute 'alter table public.profiles rename column "staffId" to staff_id';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'roleDesignation'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role_designation'
  ) then
    execute 'alter table public.profiles rename column "roleDesignation" to role_designation';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_url'
  ) then
    execute 'alter table public.profiles rename column "avatar" to avatar_url';
  end if;
end $$;

-- Ensure existing databases allow system theme mode as well.
do $$
begin
  alter table public.profiles drop constraint if exists profiles_theme_mode_check;

  alter table public.profiles
    add constraint profiles_theme_mode_check
    check (theme_mode in ('light', 'dark', 'system'));

  alter table public.profiles
    alter column theme_mode set default 'system';
exception
  when undefined_table then
    null;
end $$;

commit;
