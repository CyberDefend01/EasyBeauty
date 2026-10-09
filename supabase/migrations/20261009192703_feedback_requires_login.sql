-- Require sign-in for feedback: remove the public (anon) feedback policy,
-- so only signed-in users can submit feedback — enforced by the database.
drop policy if exists "Public can submit feedback" on public.feedback;
revoke execute on function public.check_feedback_insert() from anon;
