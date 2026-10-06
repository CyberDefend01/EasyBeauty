-- EasyBeauty — password sign-in migration.
-- Run ONCE in Supabase Dashboard → SQL Editor → New query.
-- Lets signed-in customers submit sign-ups and feedback. Admin read rules are unchanged.

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
