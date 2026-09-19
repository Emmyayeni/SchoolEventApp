-- Store real event end times for status labels, calendar exports and schedules.
-- Existing timed events receive a one-hour end time as a compatibility baseline.
begin;

alter table public.events add column if not exists end_time time;

update public.events
set end_time = (start_time + interval '1 hour')::time
where start_time is not null and end_time is null;

notify pgrst, 'reload schema';
commit;
