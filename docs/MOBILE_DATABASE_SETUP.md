# NSUK Events mobile database setup

The Android/iOS app reads events, registrations, profiles, announcements and saved events from Supabase. Faculty, department, level and event-category selection sheets read the reference catalogs. An unavailable query displays an error and retry action; it does not substitute sample choices.

## Apply to the existing project

1. Run `node scripts/prepare-database.cjs` to regenerate `supabase/APPLY_MOBILE_UPDATES.sql` from the two versioned migrations.
2. Open the configured Supabase project's SQL Editor and run that file. Do not run the full baseline over an existing database.
3. Run `npm run check:backend` to verify the expected columns, catalogs and count function exist.
4. Sign in on a phone with a student and an approved organizer account. Verify audience choices, real registration totals, saved events, and creating/editing a draft before publishing.

The update adds push-token storage and notification deduplication, enforces the existing account approval model, creates reference tables, and adds a function returning aggregate registration counts only for events the caller may see. It clears only the exact stock photo URLs that the old app inserted as defaults. It does not delete accounts, events or registrations.

The initial faculty/department catalog is migrated from this project's existing SQL baseline. It is configured reference data, not a newly verified complete university directory; the school should maintain it in Supabase. Existing catalog rows are preserved. Categories and levels are app selection choices, not activity or attendance records.

The count function accepts at most 200 event IDs per request. The app batches requests and does not grant students access to other participants' identities. Local SQL tests cover student, organizer, moderator, disabled-account and anonymous access, and rerunning both migrations.

## Mobile checks

```sh
npm ci
npm test
npm run lint
npm run check:mobile
npm start
```

Check the native date/time picker, selection sheet with the keyboard open, upload permission, Android back button, and logout on an installed development build. JavaScript exports do not verify these device interactions or produce a signed APK/IPA.

## Current deployment status

On 14 September 2026, the user applied the combined SQL in the external Supabase SQL Editor and reported success. The subsequent live read-only check passed for all expected tables and columns, reference catalogs, and the registration-count function. Local SQL regression tests also passed. Authenticated app flows and native device interactions still require the phone checks above.
