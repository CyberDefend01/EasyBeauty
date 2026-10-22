-- Waitlist: a lighter-weight interest capture, separate from full sign-up.
-- No login required to join.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  user_type text not null check (user_type in ('customer', 'professional')),
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

create policy "Public can join waitlist" on public.waitlist
  for insert
  to anon
  with check (true);

create policy "Signed-in users can join waitlist" on public.waitlist
  for insert
  to authenticated
  with check (true);

create policy "Admins can read waitlist" on public.waitlist
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can delete waitlist" on public.waitlist
  for delete
  to authenticated
  using (public.is_admin());

-- Safe rollback-based test for setup-check.html, same pattern as users/feedback.
create or replace function public.check_waitlist_insert()
returns boolean
language plpgsql
security invoker
as $$
begin
  insert into public.waitlist (full_name, email, phone, user_type)
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

grant execute on function public.check_waitlist_insert() to anon, authenticated;
