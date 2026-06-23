# Supabase Auth Setup Guide (Login + Signup)

This project now uses real Supabase authentication for login and signup.

## What was wired

- Supabase client config is in `lib/superbase.js`.
- Auth helper functions are in `lib/Auth.js`.
- App auth flow is connected in `App.js`:
  - Login uses Supabase `signInWithPassword`.
  - Signup uses Supabase `signUp`.
  - Session restore runs on app start.
  - Logout calls Supabase `signOut`.

## 1) Add your environment variables

Create a `.env` file in project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Notes:
- `lib/superbase.js` supports both:
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_SUPABASE_KEY` (fallback)
- Recommended key name is `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

After updating `.env`, restart Expo:

```bash
npx expo start -c
```

## 2) Create the profiles table in Supabase

In Supabase SQL Editor, run:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  account_type text check (account_type in ('student', 'staff')) default 'student',
  department text,
  level text,
  faculty text,
  matric_number text,
  staff_id text,
  role_designation text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();
```

## 3) Enable Row Level Security (RLS)

Run:

```sql
alter table public.profiles enable row level security;

create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
```

## 4) Supabase Auth settings to verify

In Supabase Dashboard:

- Go to Authentication -> Providers -> Email.
- Enable Email provider.
- Choose one mode:
  - Email confirmation ON: user must confirm email before login.
  - Email confirmation OFF: user can sign in immediately.

Current app behavior:
- If confirmation is required, app shows message:
  - "Account created. Check your email to verify, then log in."

## 5) How app data mapping works

Auth data is merged from:
- `auth.users` metadata (from signup)
- `public.profiles` row (if available)

Main fields used by app:
- `id`
- `accountType`
- `fullName`
- `email`
- `department`
- `level`
- `faculty`
- `matricNumber`
- `staffId`
- `roleDesignation`
- `avatar`

## 6) Test checklist

1. Signup with a new email.
2. If email confirmation is enabled, confirm email in inbox.
3. Login with the same credentials.
4. Close and reopen app; session should restore automatically.
5. Logout; app should return to auth screen.

## 7) Troubleshooting

- "Invalid email or password":
  - Check credential values and user exists in Supabase Auth.

- "Please verify your email before logging in":
  - Confirm the user email first in inbox.

- Signup works but profile fields look empty:
  - Ensure `public.profiles` table exists.
  - Ensure RLS policies above are created.

- App not reading env values:
  - Ensure keys start with `EXPO_PUBLIC_`.
  - Restart Expo with cache clear (`npx expo start -c`).

## Files changed

- `lib/superbase.js`
- `lib/Auth.js`
- `App.js`
- `SUPABASE_AUTH_SETUP.md`
