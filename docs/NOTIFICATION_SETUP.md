# Notification deployment

Apply the account approval migration first. It adds `expo_push_token` and the unique nullable notification `source_key` used for deduplication.

Deploy the two Supabase Edge Functions:

```sh
supabase functions deploy send-announcement-push --no-verify-jwt
supabase functions deploy send-event-push --no-verify-jwt
```

Set `ANNOUNCEMENT_WEBHOOK_SECRET` and `EVENT_WEBHOOK_SECRET` as strong random Supabase function secrets. Neither value belongs in the mobile app or any `EXPO_PUBLIC_*` variable. Both handlers refuse requests when their secret is missing or incorrect. Supabase injects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; keep the service key server-side.

Create database webhooks:

| Table | Operations | Function | Header |
| --- | --- | --- | --- |
| public.announcements | INSERT | send-announcement-push | x-webhook-secret matching ANNOUNCEMENT_WEBHOOK_SECRET |
| public.events | INSERT, UPDATE | send-event-push | x-webhook-secret matching EVENT_WEBHOOK_SECRET |

The event handler skips drafts and updates that do not change event details. The functions create inbox rows and request Expo push delivery for approved recipients with tokens. If Expo Enhanced Push Security is enabled, set `EXPO_ACCESS_TOKEN` as a function secret too.

Use an installed Expo development build on a physical phone with notification permission. Expo Go and the web preview do not exercise the app's native push implementation. Verify the EAS project ID and Android/iOS push credentials match the installed build.

Test with a sender and a different recipient. Verify an announcement creates one inbox item, a replay does not duplicate it, and a push tap opens the matching event/announcement. Test both granted and denied permission. A push ticket accepted by Expo is not proof of phone delivery; this prototype does not yet poll push receipts or retry failed delivery.
