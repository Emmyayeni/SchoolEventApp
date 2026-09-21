# Announcement and event push delivery

Both senders are implemented. Complete deployment, Firebase/FCM credentials and webhook setup using [the release guide](../../../RELEASE_READINESS.md).

- `send-announcement-push`: `public.announcements`, INSERT, `ANNOUNCEMENT_WEBHOOK_SECRET`.
- `send-event-push`: `public.events`, INSERT/UPDATE, `EVENT_WEBHOOK_SECRET`.
- Each webhook sends its matching secret in the `x-webhook-secret` header.
- Deploy with `--no-verify-jwt`; the functions enforce the shared secret themselves.
- The app saves one Expo push token per profile and handles notification taps in `src/navigation/AppNavigation.js`.
- Recipients must be approved and match the selected audience (`all`, `students`, or `staff`).
- Monitor delivery in the Supabase function logs and Expo push receipts. Accepted tickets alone do not confirm delivery.
