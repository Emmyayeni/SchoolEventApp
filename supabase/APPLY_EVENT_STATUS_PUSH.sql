-- Scheduled attendee alerts. Edge secret EVENT_WEBHOOK_SECRET must exist in Vault.
begin;
create extension if not exists pg_cron with schema pg_catalog;
create table if not exists public.event_status_push_queue (
  notification_id uuid primary key references public.notifications(id) on delete cascade,
  phase text not null check (phase in ('ongoing','ended')),
  boundary timestamptz not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  sent_at timestamptz,
  last_error text,
  ticket_id text
);
alter table public.event_status_push_queue enable row level security;
revoke all on public.event_status_push_queue from anon, authenticated;
grant all on public.event_status_push_queue to service_role;
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
create or replace function public.claim_event_status_pushes()
returns table(notification_id uuid,user_id uuid,event_id uuid,title text,message text,expo_push_token text,attempts integer)
language sql security definer set search_path = '' as $$
  with candidates as (
    select q.notification_id from public.event_status_push_queue q
      join public.notifications n on n.id=q.notification_id
      join public.profiles p on p.id=n.user_id and p.account_status='approved'
      join public.events e on e.id=n.event_id and e.status='published'
      join public.event_registrations r on r.event_id=e.id and r.user_id=n.user_id and r.status='registered'
      where q.sent_at is null and q.available_at <= now() and q.attempts < 5
        and q.expires_at > now()
        and q.boundary = case when q.phase='ongoing' then (e.event_date + e.start_time) at time zone 'Africa/Lagos'
          else (e.event_date + e.end_time + case when e.end_time <= e.start_time then interval '1 day' else interval '0' end) at time zone 'Africa/Lagos' end
        and p.expo_push_token is not null
      order by q.available_at limit 100 for update of q skip locked
  ), claimed as (
    update public.event_status_push_queue q set attempts=q.attempts+1,available_at=now()+interval '5 minutes'
      from candidates c where q.notification_id=c.notification_id returning q.notification_id,q.attempts
  ) select n.id,n.user_id,n.event_id,n.title,n.message,p.expo_push_token,c.attempts
    from claimed c join public.notifications n on n.id=c.notification_id join public.profiles p on p.id=n.user_id;
$$;
revoke all on function public.claim_event_status_pushes() from public,anon,authenticated;
grant execute on function public.claim_event_status_pushes() to service_role;
select cron.schedule('nsuk-event-status-push','* * * * *', $job$
  select net.http_post(
    url := 'https://bwtfwytnsphmsgpnlhiw.supabase.co/functions/v1/send-event-status-push',
    headers := jsonb_build_object('Content-Type','application/json','x-webhook-secret',
      (select decrypted_secret from vault.decrypted_secrets where name='EVENT_WEBHOOK_SECRET')),
    body := '{}'::jsonb, timeout_milliseconds := 10000
  );
$job$);
commit;
