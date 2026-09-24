-- Preserve notification identity/read state while identifying the related event.
begin;
create or replace function public.include_notification_event_title()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare event_title text;
begin
  if new.event_id is not null then
    select e.title into event_title from public.events e where e.id = new.event_id;
    if nullif(trim(event_title), '') is not null and
      strpos(lower(coalesce(new.title, '')), lower(event_title)) = 0 then
      new.title := event_title || ' — ' || coalesce(nullif(new.title, ''), 'Event update');
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.include_notification_event_title() from public, anon, authenticated;
drop trigger if exists include_event_title on public.notifications;
create trigger include_event_title before insert or update of title, event_id on public.notifications
for each row execute function public.include_notification_event_title();
update public.notifications n set title = e.title || ' — ' || coalesce(nullif(n.title, ''), 'Event update')
from public.events e where n.event_id = e.id and nullif(trim(e.title), '') is not null
  and strpos(lower(coalesce(n.title, '')), lower(e.title)) = 0;
create or replace function public.queue_event_status_notifications()
returns integer language plpgsql security definer set search_path = '' as $$
declare inserted_count integer;
begin
  with event_times as (
    select e.*, (e.event_date + e.start_time) at time zone 'Africa/Lagos' as starts_at,
      case when e.end_time is not null then
        (e.event_date + e.end_time + case when e.end_time <= e.start_time then interval '1 day' else interval '0' end) at time zone 'Africa/Lagos'
      else (e.event_date + interval '1 day') at time zone 'Africa/Lagos' end as ends_at
    from public.events e where e.status='published' and e.start_time is not null
      and e.event_date >= (now() at time zone 'Africa/Lagos')::date - 1
      and e.event_date <= (now() at time zone 'Africa/Lagos')::date
  ), due as (
    select e.id, e.title, 'ongoing' as phase, e.starts_at as boundary, least(e.ends_at, e.starts_at + interval '30 minutes') as expires_at
      from event_times e where now() >= e.starts_at and now() < e.ends_at
        and now() < e.starts_at + interval '30 minutes'
    union all
    select e.id, e.title, 'ended', e.ends_at, e.ends_at + interval '30 minutes' from event_times e
      where e.end_time is not null and now() >= e.ends_at and now() < e.ends_at + interval '30 minutes'
  ), inserted as (
    insert into public.notifications (user_id,event_id,title,message,type,source_key,is_read)
      select r.user_id, d.id,
        d.title || case when d.phase='ongoing' then ' — Ongoing' else ' — Ended' end,
        d.title || case when d.phase='ongoing' then ' is now ongoing.' else ' has ended. Thank you for attending.' end,
        'event', 'event-status:' || d.id || ':' || d.phase || ':' || extract(epoch from d.boundary)::text || ':' || r.user_id, false
      from due d join public.event_registrations r on r.event_id=d.id and r.status='registered'
        join public.profiles p on p.id=r.user_id and p.account_status='approved'
      where r.registered_at <= d.boundary
      on conflict (source_key) do nothing returning id,event_id,source_key
  ) insert into public.event_status_push_queue(notification_id,phase,boundary,expires_at)
    select i.id,d.phase,d.boundary,d.expires_at from inserted i join due d on d.id=i.event_id
      and split_part(i.source_key,':',3)=d.phase;
  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;
revoke all on function public.queue_event_status_notifications() from public,anon,authenticated;
grant execute on function public.queue_event_status_notifications() to service_role;

commit;
