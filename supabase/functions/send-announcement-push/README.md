# send-announcement-push

Server-side delivery for announcements. The app already registers each device's
Expo push token (`profiles.expo_push_token`), but nothing sent a push until this
function existed. It runs whenever a row is inserted into `public.announcements`
and (a) writes an in-app notification row per targeted user and (b) sends an Expo
push to their devices.

## Prerequisites

- Supabase CLI installed and logged in: `supabase login`
- Project linked: `supabase link --project-ref <your-project-ref>`
- `profiles.expo_push_token` column exists (the app already writes to it).
- Recipients need `account_status = 'approved'` and a non-null `expo_push_token`.

## 1. Deploy the function

```bash
supabase functions deploy send-announcement-push --no-verify-jwt
```

`--no-verify-jwt` is required because a Database Webhook calls the function
server-to-server without a user JWT. The call is instead protected by the
required shared secret below. The function refuses requests if no secret is configured.

## 2. Set secrets

```bash
# Required: a shared secret the webhook must send as the x-webhook-secret header
supabase secrets set ANNOUNCEMENT_WEBHOOK_SECRET="$(openssl rand -hex 24)"

# Only if you enabled "Enhanced Security for Push Notifications" in Expo:
# supabase secrets set EXPO_ACCESS_TOKEN="<expo access token>"
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — do
not set them yourself.

## 3. Create the Database Webhook

Dashboard → Database → Webhooks → **Create a new hook**:

- Table: `public.announcements`
- Events: `INSERT`
- Type: **Supabase Edge Functions** → `send-announcement-push`
- HTTP Headers: add `x-webhook-secret` = the value you set above

The webhook posts `{ type, table, record }`; the function reads `record`.

## 4. Test

Insert an announcement from the app's **Send Announcement** screen (or via SQL),
then check:

- Function logs: `supabase functions logs send-announcement-push`
- The response body reports `{ recipients, pushed, errors }`.
- On a physical device (dev client / EAS build, **not** Expo Go) the push arrives
  and tapping it opens the announcement (handled in `App.js`).

## Audience mapping

`announcements.target_audience` is stored normalized by the client as any of
`"all"`, `"staff"`, `"students"`:

| Screen option        | Stored value |
| -------------------- | ------------ |
| All Students         | `students`   |
| Staff Only           | `staff`      |
| Faculty of Science   | `all` ¹      |

¹ Known client quirk: "Faculty of Science" normalizes to `all` in
`src/services/supabaseData.js` (`normalizeAudience`) because it matches neither
"staff" nor "student". If you want faculty targeting, extend that function and
add a matching `profiles` column (e.g. `department`) to filter on here.

## Extending to events

To push on new events too, deploy a second webhook on `public.events` (INSERT)
pointing at a copy of this function that sets `data: { eventId: record.id }` and
`type: "event"`. The app's tap handler already routes `eventId`.
