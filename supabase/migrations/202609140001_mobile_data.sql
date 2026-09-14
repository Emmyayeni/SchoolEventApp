-- Apply after 202609130001_account_approval.sql. Additive migration; preserves application records.
begin;

create table if not exists public.academic_levels (
  name text primary key,
  sort_order integer not null default 0
);
insert into public.academic_levels(name, sort_order) values
  ('100 Level', 100), ('200 Level', 200), ('300 Level', 300),
  ('400 Level', 400), ('500 Level', 500), ('600 Level', 600), ('Postgraduate', 700)
on conflict (name) do nothing;

create table if not exists public.event_categories (name text primary key);
insert into public.event_categories(name) values
  ('Seminar'), ('Workshop'), ('Sports'), ('Social'), ('Conference'), ('Academic'),
  ('Career'), ('Cultural'), ('Health'), ('Technology'), ('Community'), ('Orientation')
on conflict (name) do nothing;
insert into public.event_categories(name)
select distinct trim(category) from public.events where trim(category) <> ''
on conflict (name) do nothing;

alter table public.academic_levels enable row level security;
alter table public.event_categories enable row level security;
drop policy if exists levels_read on public.academic_levels;
create policy levels_read on public.academic_levels for select to anon, authenticated using (true);
drop policy if exists categories_read on public.event_categories;
create policy categories_read on public.event_categories for select to authenticated using (true);
grant select on public.academic_levels to anon, authenticated;
grant select on public.event_categories to authenticated;

-- Counts only: do not expose participant identities to other attendees.
-- Match event visibility explicitly because this function bypasses registration RLS.
create or replace function public.get_event_registration_counts(p_event_ids uuid[])
returns table(event_id uuid, registered_count bigint)
language plpgsql stable security definer set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_active_account(auth.uid()) then return; end if;
  if coalesce(cardinality(p_event_ids), 0) > 200 then
    raise exception 'Request at most 200 event counts at a time';
  end if;
  return query
  select e.id, count(r.id)
  from public.events e
  join public.profiles p on p.id = auth.uid()
  left join public.event_registrations r on r.event_id = e.id and r.status = 'registered'
  where e.id = any(p_event_ids)
    and (e.created_by = auth.uid() or public.can_administer(auth.uid()) or
      (e.status = 'published' and (e.target_audience = 'all' or
        (e.target_audience = 'students' and p.account_type = 'student') or
        (e.target_audience = 'staff' and p.account_type in ('staff', 'organizer', 'admin')))))
  group by e.id;
end;
$$;
revoke all on function public.get_event_registration_counts(uuid[]) from public, anon;
grant execute on function public.get_event_registration_counts(uuid[]) to authenticated;

alter table public.profiles add column if not exists expo_push_token text;
alter table public.notifications add column if not exists source_key text;
create unique index if not exists notifications_source_key_unique on public.notifications(source_key);

create table if not exists public.academic_faculties (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.academic_departments (
  id uuid primary key default gen_random_uuid(),
  faculty_name text not null,
  name text unique not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_academic_departments_faculty on public.academic_departments(faculty_name);

alter table public.academic_faculties enable row level security;
alter table public.academic_departments enable row level security;

-- Public read access so any student or staff can view academic options
drop policy if exists "Public read faculties" on public.academic_faculties;
create policy "Public read faculties" on public.academic_faculties for select using (true);
drop policy if exists "Public read departments" on public.academic_departments;
create policy "Public read departments" on public.academic_departments for select using (true);

-- Initial project catalog: NSUK Faculties
insert into public.academic_faculties (name) values
  ('Faculty of Natural and Applied Sciences'),
  ('Faculty of Social Sciences'),
  ('Faculty of Arts'),
  ('Faculty of Administration'),
  ('Faculty of Law'),
  ('Faculty of Education'),
  ('Faculty of Agriculture'),
  ('Faculty of Environmental Science')
on conflict (name) do nothing;

-- Initial project catalog: NSUK Departments
insert into public.academic_departments (faculty_name, name) values
  ('Faculty of Natural and Applied Sciences', 'Computer Science'),
  ('Faculty of Natural and Applied Sciences', 'Mathematics'),
  ('Faculty of Natural and Applied Sciences', 'Physics'),
  ('Faculty of Natural and Applied Sciences', 'Chemistry'),
  ('Faculty of Natural and Applied Sciences', 'Microbiology'),
  ('Faculty of Natural and Applied Sciences', 'Biochemistry'),
  ('Faculty of Natural and Applied Sciences', 'Zoology'),
  ('Faculty of Natural and Applied Sciences', 'Botany'),
  ('Faculty of Natural and Applied Sciences', 'Geology'),
  ('Faculty of Social Sciences', 'Economics'),
  ('Faculty of Social Sciences', 'Mass Communication'),
  ('Faculty of Social Sciences', 'Political Science'),
  ('Faculty of Social Sciences', 'Sociology'),
  ('Faculty of Social Sciences', 'Psychology'),
  ('Faculty of Arts', 'English'),
  ('Faculty of Arts', 'History and International Studies'),
  ('Faculty of Arts', 'Theatre Arts'),
  ('Faculty of Arts', 'Languages and Linguistics'),
  ('Faculty of Arts', 'Religious Studies'),
  ('Faculty of Arts', 'Philosophy'),
  ('Faculty of Administration', 'Business Administration'),
  ('Faculty of Administration', 'Accounting'),
  ('Faculty of Administration', 'Public Administration'),
  ('Faculty of Administration', 'Banking and Finance'),
  ('Faculty of Law', 'Commercial Law'),
  ('Faculty of Law', 'Public Law'),
  ('Faculty of Law', 'Private Law'),
  ('Faculty of Education', 'Educational Foundations'),
  ('Faculty of Education', 'Science Education'),
  ('Faculty of Education', 'Arts Education'),
  ('Faculty of Agriculture', 'Agronomy'),
  ('Faculty of Agriculture', 'Animal Science'),
  ('Faculty of Agriculture', 'Agricultural Economics and Extension'),
  ('Faculty of Environmental Science', 'Architecture'),
  ('Faculty of Environmental Science', 'Urban and Regional Planning'),
  ('Faculty of Environmental Science', 'Geography')
on conflict (name) do nothing;


grant select on public.academic_faculties, public.academic_departments to anon, authenticated;
notify pgrst, 'reload schema';
commit;
