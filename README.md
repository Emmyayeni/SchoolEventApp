# NSUK Events

A React Native and Expo campus event information system for Nasarawa State University, Keffi. Supabase provides authentication, PostgreSQL storage, image storage and realtime updates.

## Run locally

1. Install Node.js and run `npm ci`.
2. Create `.env.local` with the variables below and supply your Supabase public URL and anon/publishable key. Never place a service-role key in an Expo public variable.
3. Follow the backend steps in [the completion checklist](docs/PROJECT_COMPLETION.md). The SQL baseline and migration must match the configured database.
4. Run `npm start` for Expo, or `npm run web` for the browser preview.

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

Environment files are ignored by Git. Keep your local values on your device.

## Verify

```sh
npm test
npm run lint
npm run check:backend
npm run check:mobile
```

`check:mobile` exports the Android and iOS JavaScript/Hermes bundles. Test the app using `npm start` on a phone or a development build. These exports are not installable APK/IPA files.

`check:backend` checks columns and the registration-count function without retrieving user records; it does not prove authentication or live row-level security. Database regression tests use an isolated PostgreSQL instance with local fixture accounts.

For the existing database, see [mobile database setup](docs/MOBILE_DATABASE_SETUP.md). The optional web preview is only a development aid; Android and iOS are the app targets.

Native notifications and custom password-reset links require an installed development build. A JavaScript export is not an APK/IPA or proof that native device features work.

## Features

- Validated student, staff and organizer signup; approval-aware authentication and password recovery.
- Event discovery, search, date/category filters, RSVP, waitlists, bookmarks and registration history.
- Organizer event editing, banners, participant lists and profile/avatar updates.
- Admin account approval and management, event moderation, RSVP statistics and report sharing.
- Audience-based announcements, attachments, realtime inbox updates, event notification webhooks and local reminders.
- Light/dark themes, loading/error states and layouts that fit phone and desktop previews.

## Project structure

- `App.js`: fonts, theme, providers and app navigation.
- `src/context`: authenticated session and event data state.
- `src/navigation`: app, admin and detail routes.
- `src/screens` and `src/components`: interface screens and reusable controls.
- `src/services`: Supabase queries, storage and device notifications.
- `lib/Auth.js`: authentication and profile mapping.
- `supabase/migrations`: schema and permission changes prepared for review.
- `supabase/functions`: announcement and event webhook handlers.
- `tests`: regression checks using Node's test runner and mocked external services.

## School project scope and remaining verification

[PROJECT_COMPLETION.md](docs/PROJECT_COMPLETION.md) maps Chapters 1–3 to the implementation, deployment requirements and demo acceptance tests. [NOTIFICATION_SETUP.md](docs/NOTIFICATION_SETUP.md) explains webhook configuration.

The accompanying work does not fabricate user-study results, attendance figures or delivery guarantees. Run the real-account, permissions and phone checks in the checklist before describing the whole system as complete in the final report.
