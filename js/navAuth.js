/* Shows elements marked .feedback-link only when a visitor is signed in.
   Feedback also requires sign-in at the database level (see
   supabase/migration-feedback-requires-login.sql) — this just keeps the
   button from appearing when it wouldn't work anyway. Every element
   starts with the "hidden" class in the HTML so there's no flash of a
   button that then disappears. */

(function () {
  function setFeedbackLinksVisible(visible) {
    document.querySelectorAll(".feedback-link").forEach(el => {
      el.classList.toggle("hidden", !visible);
    });
  }

  if (!isSupabaseConfigured()) return;

  const supabase = getSupabase();
  supabase.auth.getSession().then(({ data }) => setFeedbackLinksVisible(!!data.session));
  supabase.auth.onAuthStateChange((_event, session) => setFeedbackLinksVisible(!!session));
})();
