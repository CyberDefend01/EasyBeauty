-- Lets admins delete sign-up and feedback rows from the Admin Dashboard.
-- Still restricted to is_admin() — nobody else can delete anything.
create policy "Admins can delete users" on public.users
  for delete
  to authenticated
  using (public.is_admin());

create policy "Admins can delete feedback" on public.feedback
  for delete
  to authenticated
  using (public.is_admin());
