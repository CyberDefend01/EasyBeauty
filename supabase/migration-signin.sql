-- EasyBeauty — sign-in migration.
-- Run ONCE in Supabase Dashboard → SQL Editor → New query.
-- Already set to the admin email; it must match your Step 10 login exactly.

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
