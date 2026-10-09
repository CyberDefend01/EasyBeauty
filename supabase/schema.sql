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
