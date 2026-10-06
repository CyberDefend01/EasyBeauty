/* EasyBeauty configuration template.
   Copy this file to js/config.js and fill in your real values.
   js/config.js is gitignored — it is the one place your real
   Supabase settings live.

   SUPABASE_ANON_KEY is Supabase's public "anon" key. It is designed
   to be used in frontend code (unlike the "service_role" key, which
   must NEVER appear here or anywhere in this project). Access to
   your data is controlled by the Row Level Security policies in
   supabase/schema.sql, not by keeping this key secret.
   See BEGINNER_SETUP_GUIDE.md for full instructions — it's the only
   setup you need. */

window.BC_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT-REF.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-SUPABASE-ANON-PUBLIC-KEY",

  // Optional, advanced: only needed if you also want a live copy of
  // every sign-up/feedback row synced into a Google Sheet. Leave this
  // empty (the default) and the site works exactly the same — Supabase
  // is the real database either way, and the Admin Dashboard's Excel
  // export already gives you a downloadable spreadsheet without this.
  // See SETUP_GUIDE.md if you want to turn it on later.
  SHEETS_WEBAPP_URL: ""
};
