# EasyBeauty — Beginner Setup Guide

This is the **only guide you need**. It assumes you have never used Supabase,
a database, or an API before. Follow every step in order — it takes about
15 minutes.

By the end, real people will be able to sign up and leave feedback on your
website, and you'll be able to see and download that data from a private
Admin Dashboard.

**Google Sheets is optional** and not part of this guide — everything below
works completely on its own. If you want the extra Google Sheets copy later,
see the separate `SETUP_GUIDE.md` file, but you don't need it.

---

## Before you start

You will need:
- An email address (to create a free Supabase account)
- 15 minutes
- This project open on your computer, so you can edit one file (`js/config.js`)

You will **never** be asked to share a password, secret key, or database
password with anyone — including me. The only two things you'll copy into
this project are both meant to be public (explained in Step 8).

---

## Step 1: Go to Supabase

Open [supabase.com](https://supabase.com) in your browser and click
**Start your project**. Sign up with your email or GitHub account — it's free.

## Step 2: Click New Project

Once you're logged in, click **New Project**.

## Step 3: Create the project

Fill in:
- **Name:** `easybeauty` (or anything you like)
- **Database Password:** click "Generate a password" and then **save it
  somewhere safe** (a notes app is fine). You won't need it for this guide,
  but Supabase requires you to set one.
- **Region:** pick the one closest to Nigeria (e.g. anything labeled
  `Europe West` or `South Africa`).

Click **Create new project** and wait about 2 minutes while Supabase sets
it up.

## Step 4: Open SQL Editor

Once your project is ready, look at the left sidebar. Click the icon that
looks like `</>` labeled **SQL Editor**. Click **New query**.

## Step 5: Copy this exact SQL

Copy everything in the box below (click inside the box, then Ctrl+A / Cmd+A,
then Ctrl+C / Cmd+C) and paste it into the SQL Editor box on the Supabase
website.

```sql
-- EasyBeauty — Supabase schema
-- Run this once in Supabase Dashboard → SQL Editor → New query.
-- See BEGINNER_SETUP_GUIDE.md for the full walkthrough.

create extension if not exists pgcrypto;

-- ===== Users (sign-ups) =====
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text not null,
  user_type text not null check (user_type in ('customer', 'professional')),
  created_at timestamptz not null default now()
);

-- ===== Feedback =====
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  feedback_type text not null check (
    feedback_type in ('General Feedback', 'Suggestion', 'Problem/Bug', 'Feature Request')
  ),
  rating smallint not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

-- ===== Row Level Security =====
alter table public.users enable row level security;
alter table public.feedback enable row level security;

-- Anyone (not signed in) can sign up — that's how a visitor gets an
-- account in the first place.
create policy "Public can sign up" on public.users
  for insert
  to anon
  with check (true);

-- Feedback requires being signed in. There is no anon insert policy here
-- on purpose, so the database itself enforces this, not just the UI.
create policy "Signed-in users can sign up" on public.users
  for insert
  to authenticated
  with check (true);

create policy "Signed-in users can submit feedback" on public.feedback
  for insert
  to authenticated
  with check (true);

-- Admin read access is granted only to emails listed in public.admins.
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;

-- Add your admin email with: insert into public.admins (email) values ('you@example.com');

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

create policy "Admins can read users" on public.users
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can read feedback" on public.feedback
  for select
  to authenticated
  using (public.is_admin());

-- Only admins can delete rows (from the Admin Dashboard or Table Editor).
-- No update policies exist — nobody can edit a row's contents, only
-- remove it entirely, which keeps the remaining data trustworthy.
create policy "Admins can delete users" on public.users
  for delete
  to authenticated
  using (public.is_admin());

create policy "Admins can delete feedback" on public.feedback
  for delete
  to authenticated
  using (public.is_admin());

-- ===== Setup-check helper functions =====
-- These insert a throwaway row and then force a rollback, so the setup
-- check never leaves fake data behind. A real RLS or missing-table error
-- is re-raised so the check reports a failure instead of a false pass.

create or replace function public.check_users_insert()
returns boolean
language plpgsql
security invoker
as $$
begin
  insert into public.users (full_name, email, phone, user_type)
  values ('__setup_check__', '__setup_check__@easybeauty.test', '0000000000', 'customer');
  raise exception 'ROLLBACK_OK';
exception
  when others then
    if SQLERRM = 'ROLLBACK_OK' then
      return true;
    else
      raise;
    end if;
end;
$$;

create or replace function public.check_feedback_insert()
returns boolean
language plpgsql
security invoker
as $$
begin
  insert into public.feedback (name, feedback_type, rating, comment)
  values ('__setup_check__', 'General Feedback', 5, '__setup_check__');
  raise exception 'ROLLBACK_OK';
exception
  when others then
    if SQLERRM = 'ROLLBACK_OK' then
      return true;
    else
      raise;
    end if;
end;
$$;

grant execute on function public.check_users_insert() to anon, authenticated;
grant execute on function public.check_feedback_insert() to authenticated;
```

> **What does this do?** It creates two tables — one for sign-ups, one for
> feedback — and locks them down so that anyone can *submit* a form, but
> only you (once logged in as admin) can *read* the results. The last two
> blocks power the Setup Check page in Step 11 — they let it safely test
> that sign-ups work without ever leaving fake data behind.

**5b. Add your admin email** (replace the email before running)

```sql
insert into public.admins (email) values ('cyberdefendafricaltd@gmail.com')
on conflict do nothing;
```

## Step 6: Click Run

Click the **Run** button (or press Ctrl+Enter / Cmd+Enter). You should see
a message like "Success. No rows returned." That means it worked.

## Step 7: Go to Project Settings → API

In the left sidebar, click the gear icon (⚙️) for **Project Settings**,
then click **API** in the settings menu.

## Step 8: Copy the Project URL and anon/public key

On that page you'll see two values you need:

- **Project URL** — looks like `https://abcdefgh.supabase.co`
- **anon / public key** — a long string starting with `eyJ...`

Both of these are safe to use in a website's code — that's what "public"
means. **Do not** copy the key labeled `service_role` (further down the
page) — that one is secret and this project never needs it.

## Step 9: Paste them into EasyBeauty

In this project, open the file **`js/config.js`** in any text editor.
It looks like this:

```js
window.BC_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
  SHEETS_WEBAPP_URL: ""
};
```

Paste your values in between the quotes, so it looks like this (using your
own values, not these examples):

```js
window.BC_CONFIG = {
  SUPABASE_URL: "https://abcdefgh.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  SHEETS_WEBAPP_URL: ""
};
```

Leave `SHEETS_WEBAPP_URL` exactly as `""` — that's what keeps Google Sheets
optional and off. Save the file.

## Step 10: Create your Admin account

This is the login you'll personally use to see the collected data. There is
no public sign-up for this — you create it directly in Supabase:

1. In the Supabase sidebar, click **Authentication**.
2. Click **Users**, then **Add user → Create new user**.
3. Type in your own email and choose a password.
4. Turn on **Auto Confirm User** (important — otherwise it will ask you to
   verify by email first).
5. Click **Create user**.

Remember this email and password — it's your Admin Dashboard login.

---

## Step 12: Turn on customer sign-in (do this once)

This lets customers and beauty professionals create a password on
`signup.html` and sign in on `signin.html` with their email and password.
It also makes sure only your admin email can see the collected data.

**12a. Add your admin email to the protection list**

1. Go to Supabase → **SQL Editor** → **New query**.
2. Copy the SQL below and paste it in.
3. Check that the email on the line below matches the one you used in Step 10.
4. Click **Run**. You should see "Success. No rows returned."

```sql
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;

insert into public.admins (email) values ('cyberdefendafricaltd@gmail.com')
on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Admins can read users" on public.users;
drop policy if exists "Admins can read feedback" on public.feedback;

create policy "Admins can read users" on public.users
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can read feedback" on public.feedback
  for select
  to authenticated
  using (public.is_admin());
```

**12b. Run the password-accounts SQL**

1. Go to Supabase → **SQL Editor** → **New query**.
2. Paste this and click **Run**. You should see "Success. No rows returned."

```sql
create policy "Signed-in users can sign up" on public.users
  for insert
  to authenticated
  with check (true);

create policy "Signed-in users can submit feedback" on public.feedback
  for insert
  to authenticated
  with check (true);

grant execute on function public.check_users_insert() to authenticated;
grant execute on function public.check_feedback_insert() to authenticated;
```

**12c. Set the email and redirect settings**

1. Go to **Authentication → URL Configuration**.
2. Set **Site URL** to `http://localhost:8000` while testing. After
   deploying, use your live address.
3. Under **Redirect URLs**, add `http://localhost:8000/signin.html`, and
   your live address followed by `/signin.html` once you have one. Click **Save**.
4. Go to **Authentication → Sign In / Providers**, make sure **Email** is on,
   and turn **Confirm email** **off** for this pilot. With it on, new users
   must click a confirmation link before they can sign in.

**12d. Test it**

1. Make sure the site is running (`python3 -m http.server 8000`).
2. Open `http://localhost:8000/signup.html`, create a test account with a
   password of at least 8 characters, and submit.
3. Open `http://localhost:8000/signin.html`, enter that email and password,
   and click **Sign In**. You should see "You're signed in".
4. Test **Forgot your password?** on the same page. Click the link in the
   reset email, choose a new password, and confirm you're signed in.
5. Open `admin-login.html` with your admin account. The dashboard should load
   your data. A non-admin account sees a clear "doesn't have admin access"
   message instead.

> **Email limits:** Supabase's built-in email (used for password reset) is
> limited to a few messages per hour. That's fine for testing. For a larger
> pilot, connect a free email sender later under Authentication → SMTP Settings.

## How to log into the Admin Dashboard

1. Open `admin-login.html` in your browser (e.g.
   `http://localhost:8000/admin-login.html` if you're running the site
   locally, or `yoursite.com/admin-login.html` once deployed).
2. Enter the email and password from Step 10.
3. You'll land on the dashboard showing totals, a Users table, and a
   Feedback table, with buttons to export everything to Excel.

---

## Step 11: Confirm it all worked — Setup Check page

Open `setup-check.html` in your browser (e.g.
`http://localhost:8000/setup-check.html`). It automatically checks:

- Is Supabase connected?
- Are the Users and Feedback tables available?
- Can a test sign-up / feedback be submitted? *(tested safely — nothing
  fake is ever saved, see the note in Step 5)*
- Can the Admin Dashboard read data? *(log in first for this one to fully pass)*
- Is Excel export working?

Every line should show ✅. If something shows ❌ or ⚠️, its message tells
you exactly what to fix — see also Troubleshooting below.

---

## Troubleshooting

**"EasyBeauty isn't connected to a database yet" banner won't go away**
You haven't saved `js/config.js` with your real values yet, or there's a
typo. Re-check Step 9 — make sure the quotes and commas are still there and
you didn't accidentally delete anything.

**Setup Check says "Users table not found"**
The SQL from Step 5 didn't run successfully. Go back to Step 4, paste it
again, and click Run — read any red error text at the bottom of the SQL
Editor for a clue.

**Setup Check says "Supabase rejected your anon key"**
You likely copied the wrong key. Go back to Step 7 and make sure you copied
the one labeled **anon / public**, not `service_role`.

**I can't log into the Admin Dashboard**
Double check the email/password match exactly what you set in Step 10, and
that you ticked **Auto Confirm User** when creating it. If you forgot that,
go to Authentication → Users, click your user, and confirm it manually.

**Sign-up says "This email is already registered"**
Someone (maybe you, testing) already signed up with that email. Use a
different email, or view/remove the old one from Supabase → Table Editor →
`users`.

**The Admin Dashboard is stuck on "Loading dashboard..."**
Open your browser's developer console (F12 or right-click → Inspect →
Console) for the exact error. Most often this means `js/config.js` has the
wrong Project URL, or the SQL from Step 5 wasn't run.

**Excel export button does nothing / shows an error**
This needs an internet connection (it loads a small library from a CDN the
first time). Reload the page and try again.

**Sign-in says "Email or password is incorrect"**
Check the email spelling and password. If you forgot the password, use
**Forgot your password?** on the sign-in page.

**Sign-in says "Please confirm your email first"**
Turn off **Confirm email** under Authentication → Sign In / Providers (Step 12c),
then sign up again or sign in.

**Password reset email says "Too many reset emails"**
Supabase's built-in email has a short hourly limit. Wait about an hour and
try again. The email may also be in your spam folder.

**Password reset link opens the homepage or shows an error**
The address isn't on Supabase's allowed list. Redo Step 12c and make sure
`http://localhost:8000/signin.html` is listed under Redirect URLs.

**Signed in, but the dashboard says my account doesn't have admin access**
You signed in with an email that isn't on the admin list, or the email is
spelled differently. Re-run the SQL in Step 12a with the exact admin email,
then log out and back in.

**Setup Check says "isn't in the admins table"**
Same fix as above: complete Step 12a with your admin email, then run checks
again.

**I want to change or delete a sign-up/feedback record**
On purpose, nobody — not even the admin login — can edit or delete records
through the website, to keep your validation data trustworthy. To fix a
mistake, go to Supabase → Table Editor, open the `users` or `feedback`
table, and edit the row directly there.

---

## Final test — do this once to confirm everything works

1. Open your site's `signup.html` page. Fill in a **real** name, your real
   email, your real phone number, and choose **Customer**. Submit it.
2. You should see a "Welcome to EasyBeauty!" message.
3. Open `feedback.html`. Fill in a name, pick a rating, write a short
   comment, and submit it.
4. You should see "Thank you! Your feedback has been received..."
5. Open `admin-login.html` and log in with your admin account from Step 10.
6. On the dashboard, confirm:
   - **Total Users** shows at least 1
   - **Total Customers** shows at least 1
   - **Total Feedback** shows at least 1
   - Your test sign-up appears in the Users table
   - Your test feedback appears in the Feedback table
7. Click **Export All Data to Excel** — an `.xlsx` file should download.
   Open it in Excel (or Google Sheets/Numbers) and confirm your test
   records are in it, on two separate tabs (Users and Feedback).

If all seven steps worked, EasyBeauty is fully connected and ready to
start collecting real validation evidence.

---

## Step 13: Put EasyBeauty online with Vercel

Your local site only works on your computer. These steps publish it at a
public address, such as `https://easybeauty.vercel.app`.

**13a. Install Node.js (once)**
Download the **LTS** version from [nodejs.org](https://nodejs.org) and install it.

**13b. Deploy from Terminal**
1. Open Terminal and run:
   ```
   cd /Users/apple/Documents/BeautyCircle
   npx vercel
   ```
2. Sign in when asked (it opens your browser). Choose a Vercel account.
3. Answer the prompts: **Set up and deploy? → Yes**, project name
   **easybeauty**, and keep the default settings for everything else.
4. The first deployment will show an error about missing settings. That's
   expected. Continue to 13c.

**13c. Add your Supabase settings to Vercel**
1. Go to vercel.com → your **easybeauty** project → **Settings → Environment Variables**.
2. Add these two (the same values as in `js/config.js`):
   - Name `SUPABASE_URL`, Value: your Project URL
   - Name `SUPABASE_ANON_KEY`, Value: your **anon / public** key
3. Click **Save** for each.

These are the only two values Vercel needs. Never add the `service_role` key.

**13d. Publish**
1. In Terminal, run `npx vercel --prod`.
2. Vercel prints your live address, such as `https://easybeauty.vercel.app`.

**13e. Allow sign-in on the live address**
1. In Supabase, go to **Authentication → URL Configuration**.
2. Set **Site URL** to your live address (for example `https://easybeauty.vercel.app`).
3. Under **Redirect URLs**, add `https://easybeauty.vercel.app/signin.html`. Click **Save**.

**13f. Test the live site**
1. Open `https://YOUR-ADDRESS/setup-check.html` and confirm the checks pass.
2. Open `https://YOUR-ADDRESS/admin-login.html` and sign in as admin.

**Updating later:** after any change, run `npx vercel --prod` again.
