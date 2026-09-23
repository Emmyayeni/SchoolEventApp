# NSUK Events: release and push setup

## Verified status (23 September 2026)

- All expected database columns are now available, including events.end_time after the migration.
- Both push functions are deployed. Their secrets are configured in Edge Functions and Vault; the event and announcement triggers are enabled. Unauthorized calls return 401; authenticated non-delivery checks pass.
- Firebase configuration is present, validated, and uploaded to the preview and production EAS environments. The matching FCM V1 service account is assigned to the Android application in EAS.
- A targeted push returned an Expo receipt of `ok`; the user confirmed its banner appeared on the installed Android APK.
- `send-event-status-push` and its minute-by-minute cron job are deployed. Registered, approved attendees receive ongoing and ended alerts based on Nigeria time. Ended alerts require an explicit end time. Queue entries retry transient failures, expire after at most 30 minutes, and reject cancelled or rescheduled events. Physical-device testing of both scheduled transitions is still required.
- The updated notification controls, bottom navigation and event-history UI require a new APK.

Expo project: https://expo.dev/accounts/nsuk-events/projects/nsuk-events

Owner: nsuk-events. Project ID: ba4b45b8-62ca-450c-b700-32abc37c6595.

## Firebase credentials: browser steps

1. Open https://console.firebase.google.com/ and create a project named NSUK Events.
2. Add an Android app using exactly `com.ayeniemmy.myproject` as the package name. Keep this existing identifier.
3. Download `google-services.json` to the project root. This file is ignored by Git.
4. Open Firebase Project settings > Service accounts > Generate new private key. Keep this second JSON file outside the repository; never paste it into chat or put it in EXPO_PUBLIC variables.
5. Open NSUK Events on https://expo.dev/ . Go to Project settings > Credentials and select the Android application identifier `com.ayeniemmy.myproject`.
6. Under Service Credentials > FCM V1 service account key, choose Add a service account key. Upload the private JSON from step 4 and save.
7. In the Expo project's Environment variables, add `GOOGLE_SERVICES_JSON`, type File, using the file from step 3. Assign it to both preview and production. app.config.js reads the file path provided by EAS. A local ignored file is not automatically available in remote builds.
8. Ensure both files belong to the same Firebase project and the Firebase Cloud Messaging API is enabled.

Official guides:
- https://docs.expo.dev/push-notifications/fcm-credentials/
- https://docs.expo.dev/eas/environment-variables/

The service-account JSON authorizes Expo to send pushes. google-services.json registers the installed Android app with Firebase. They are different files.

## Deploy the Supabase senders

Run these from the project directory after signing in:

```powershell
npx supabase login
npx supabase link --project-ref bwtfwytnsphmsgpnlhiw
npx supabase functions deploy send-event-push --project-ref bwtfwytnsphmsgpnlhiw --no-verify-jwt
npx supabase functions deploy send-announcement-push --project-ref bwtfwytnsphmsgpnlhiw --no-verify-jwt
```

In the Supabase dashboard's Edge Function secrets, set independently generated values for EVENT_WEBHOOK_SECRET and ANNOUNCEMENT_WEBHOOK_SECRET. Set EXPO_ACCESS_TOKEN there only if enhanced push security is enabled in Expo. None belong in the mobile app.

Create these Database Webhooks in Supabase:

| Table | Changes | Function | x-webhook-secret header |
| --- | --- | --- | --- |
| public.events | INSERT, UPDATE | send-event-push | Value of EVENT_WEBHOOK_SECRET |
| public.announcements | INSERT | send-announcement-push | Value of ANNOUNCEMENT_WEBHOOK_SECRET |

The functions require the matching secret and reject calls if it is missing. The no-verify-jwt deployment option allows the server-to-server webhook to reach that authentication check.

## Validate and build

```powershell
npm run lint
npm run typecheck
npm test
npm run check:backend
npm run check:release
npm run check:mobile
npx eas-cli@latest build --platform android --profile preview
```

The preview profile creates an installable APK. The EAS post-install check validates Firebase package matching and required assets. It does not verify remote credentials or prove delivery. The local native export is not a signed store build.

Install the APK on a physical Android phone, sign in with an approved test account and allow notifications. Confirm its profile has an Expo push token. From a separate organizer test account, publish a test event/announcement for that recipient. Verify foreground, background and closed-app delivery, then tap each push to confirm detail navigation. Also test permission denial, re-enabling permission in Settings, and reopening after being offline. Use designated test recipients only. Inspect Supabase function logs and Expo push receipts; accepted tickets alone do not confirm delivery.

After those checks pass:

```powershell
npx eas-cli@latest build --platform android --profile production
```

Production creates an AAB for Google Play. Test through a Play internal testing track before publishing; AAB files cannot be directly installed like APKs. Native credential/plugin changes need a new build. Production build numbers increment through EAS.

For iOS, configure Apple distribution/APNs credentials and test a signed physical-device build separately. Firebase Android setup does not enable iOS notifications.

Current token storage retains one push token per profile: the most recently registered device receives remote pushes. It is not a multi-device registration system.

## Scheduled event status alerts

Deploy `send-event-status-push` with `--no-verify-jwt` and apply `supabase/APPLY_EVENT_STATUS_PUSH.sql`. It uses the existing EVENT_WEBHOOK_SECRET in Vault and Edge Function secrets. The protected queue is service-role-only; inbox notifications are deduplicated by event, phase, boundary and recipient. A successful Expo ticket marks the queue sent; it is not a delivery receipt. Delivery can duplicate if a worker crashes after Expo accepts a send but before saving the ticket.
