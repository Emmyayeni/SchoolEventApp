# NSUK Events implementation and demonstration checklist

This checklist maps the application to sections 1.3, 1.5 and 3.2.3 of *Development of a Mobile-Based App Information System for NSUK Campus Events*. Code implementation and successful user testing are separate milestones. No user-study results have been collected by the automated checks.

## Requirements and implementation

| Chapter requirement | Implementation | Acceptance check |
| --- | --- | --- |
| Registration and secure authentication | Validated login/signup, email-confirmation handling, approved staff/organizer access, session recovery | Create a student account, confirm email, sign in, restart the app and sign out. Pending and disabled accounts must be refused. |
| Administrator and organizer management | Approval, disabling and account-type editing; permissions enforced by the accompanying SQL migration | A student must not approve themselves or edit another account, including through direct API requests. |
| Event creation, editing and deletion | Validated event form; owner and admin operations; banner upload | Organizer creates an event, uploads a banner, updates its venue and deletes it. An unrelated student cannot mutate it. |
| Search and categorization | Keyword/category filters and actual Today/Tomorrow matching | Search by title and venue; verify each date filter against a known event. |
| Event details | Saved title, description, date, time, venue and audience; calendar uses Nigeria time | Compare displayed details with the database and the calendar draft. Calendar duration defaults to one hour because no event-end field is currently stored. |
| RSVP and event history | Registrations, capacity waitlist and My Registrations sidebar entry | Register once, attempt a repeat, fill a limited-capacity event, and verify past registrations remain accessible. |
| Participant monitoring | Participant list for the event owner or authorized admin; RSVP-based statistics | Compare registered/waitlisted names and counts against the database. RSVP counts are not attendance measurements. |
| Event bookmarking | Saved Events receives actual bookmark IDs and supports removal | Bookmark, reload, open Saved Events, remove the bookmark and reload again. |
| User profiles | Profile edits and avatar upload preserve account authority | Change a name/avatar and confirm that approval status and admin privileges do not change. |
| Announcements | Audience selection, attachment upload/opening, native sharing and webhook dispatch | Publish to students only; verify staff do not receive the announcement. Test sender and recipient separately. |
| Event notifications | Event INSERT/UPDATE webhook implementation plus notification navigation and realtime inbox refresh | Deploy the webhook; publish and update an event; verify inbox delivery and a phone push tap. |
| Event reminders | Local alerts 15 minutes before the start, reconciled after registrations, refreshed event changes and login | Use an installed development build and a future event with notification permission. Change the event time, refresh, cancel the event and verify old reminders are removed. |
| Responsive interface | Bounded scaling, readable theme colors, scrollable auth forms, loading/error states | Verify phone widths and actual Android/iOS keyboards, pickers and back navigation. |
| Evaluation of effectiveness | This document supplies a repeatable demo checklist | Collect real observations, task timings and participant feedback before writing claims of improved awareness, usability or participation. |

## Backend setup that remains necessary

The read-only schema check on 14 September 2026 passed for events, registrations, announcements and admin users. It found two missing columns: `profiles.expo_push_token` and `notifications.source_key`. Both are included in the migration below and are needed for push-token storage and notification deduplication. A schema check does not prove row-level security, storage policies or authentication flows are correct.

1. For a **fresh database**, run `SUPABASE_FULL_SCHEMA.sql` first. Do not rerun that baseline on a configured database without reviewing its existing schema and policies.
2. Apply `supabase/migrations/202609130001_account_approval.sql` to a test project first, then verify it before applying it to the configured project. It adds approval/push fields and notification deduplication, protects role/status updates, and provides admin event permissions. It preserves existing account statuses; if the column is absent, existing profiles default to approved for compatibility.
3. Follow `STORAGE_SETUP.md` for the `avatars`, `event-images` and `announcement-files` buckets. Verify uploads use the authenticated user's folder.
4. Add `nsuk-events://reset-password` to Supabase Auth's allowed redirect URLs. Build/install a fresh native app so the new scheme is registered. The complete email reset flow needs testing on that build.
5. Deploy `send-announcement-push` for announcement INSERTs and `send-event-push` for event INSERTs/UPDATEs. Configure their required shared secrets and matching webhook headers; see `docs/NOTIFICATION_SETUP.md`.
6. Enable Supabase Realtime for events, announcements and notifications. Use two accounts to test audience restrictions.

The migration and functions are prepared locally. They have not been deployed or executed against the live database by this work.

## Remaining limits before claiming completion

- Event labels, date filters and picker dates use the campus calendar in Nigeria. Status displays assume a two-hour duration because the schema has no end time; calendar exports retain their one-hour default. A stored end time is needed to replace these estimates.

- Authenticated end-to-end tests need a disposable student account and an approved organizer/admin account. No accounts, emails, announcements or push messages were created/sent by the automated checks.
- Native bundles are not installable APK/IPA files. Device permission, email links, uploads and push receipt need actual phone testing.
- Webhook code deduplicates inbox inserts. Push receipt polling, delivery retries and pagination beyond Supabase's configured row limit are not implemented; this is a project prototype, not a guaranteed-delivery service.
- Reminder changes require the app to receive refreshed event data. A disconnected device can retain an old local reminder until it reconnects; event-update pushes supplement that behavior.
- Scheduled announcements are not implemented and their scheduling action is hidden. Payments, ticket sales, biometric entry and livestreaming remain outside the stated thesis scope.
- Large datasets need pagination. Admin analytics currently summarize rows available to the account, within the API row limit.

## Evidence to capture for the final report

Capture screenshots for student registration/login, organizer approval, event publishing, search, RSVP/waitlist, participant list, Saved Events, event history, notifications and profile editing. Record expected result, actual result and pass/fail for each case above. Record device/build and date alongside actual usability measurements; do not replace observations with fabricated survey figures.
