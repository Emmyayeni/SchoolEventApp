-- Run this once in the Supabase SQL Editor for the existing NSUK Events project.
-- It is safe to rerun and preserves existing events.
begin;

alter table public.events add column if not exists end_time time;

update public.events
set end_time = (start_time + interval '1 hour')::time
where start_time is not null and end_time is null;

notify pgrst, 'reload schema';
commit;
