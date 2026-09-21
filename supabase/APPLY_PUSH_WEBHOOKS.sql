-- Requires EVENT_WEBHOOK_SECRET and ANNOUNCEMENT_WEBHOOK_SECRET in both
-- Edge Function secrets and Vault. Values are never stored in this migration.
begin;
create extension if not exists pg_net with schema extensions;
create or replace function public.dispatch_nsuk_push()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  endpoint text;
  secret_name text;
  webhook_secret text;
begin
  if TG_TABLE_SCHEMA <> 'public' then
    raise exception 'Unsupported push schema';
  end if;
  if TG_TABLE_NAME = 'events' then
    endpoint := 'send-event-push';
    secret_name := 'EVENT_WEBHOOK_SECRET';
  elsif TG_TABLE_NAME = 'announcements' and TG_OP = 'INSERT' then
    endpoint := 'send-announcement-push';
    secret_name := 'ANNOUNCEMENT_WEBHOOK_SECRET';
  else
    raise exception 'Unsupported push table or operation';
  end if;
  select decrypted_secret into webhook_secret
    from vault.decrypted_secrets where name = secret_name;
  if webhook_secret is null then
    raise exception 'Push webhook secret is not configured';
  end if;
  perform net.http_post(
    url := 'https://bwtfwytnsphmsgpnlhiw.supabase.co/functions/v1/' || endpoint,
    headers := jsonb_build_object('Content-Type','application/json','x-webhook-secret',webhook_secret),
    body := jsonb_build_object('type',TG_OP,'schema',TG_TABLE_SCHEMA,'table',TG_TABLE_NAME,
      'record',to_jsonb(NEW),'old_record',case when TG_OP = 'UPDATE' then to_jsonb(OLD) else null end),
    timeout_milliseconds := 10000
  );
  return NEW;
end;
$$;
revoke all on function public.dispatch_nsuk_push() from public, anon, authenticated;
drop trigger if exists nsuk_event_push on public.events;
create trigger nsuk_event_push after insert or update on public.events
  for each row execute function public.dispatch_nsuk_push();
drop trigger if exists nsuk_announcement_push on public.announcements;
create trigger nsuk_announcement_push after insert on public.announcements
  for each row execute function public.dispatch_nsuk_push();
commit;
