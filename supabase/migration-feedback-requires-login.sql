-- EasyBeauty — require sign-in for feedback.
-- Run ONCE in Supabase Dashboard → SQL Editor → New query.
-- Removes the public (anon) feedback policy, so only signed-in users can
-- submit feedback — enforced by the database, not just the website.

drop policy if exists "Public can submit feedback" on public.feedback;
revoke execute on function public.check_feedback_insert() from anon;
