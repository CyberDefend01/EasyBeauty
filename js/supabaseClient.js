/* Initializes the shared Supabase client from js/config.js.
   Loaded after config.js and the Supabase UMD script, before any
   page-specific script that needs `getSupabase()`. */

function isSupabaseConfigured() {
  return Boolean(
    window.BC_CONFIG &&
    window.BC_CONFIG.SUPABASE_URL &&
    window.BC_CONFIG.SUPABASE_ANON_KEY
  );
}

let _bcSupabase = null;
function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!_bcSupabase) {
    _bcSupabase = window.supabase.createClient(
      window.BC_CONFIG.SUPABASE_URL,
      window.BC_CONFIG.SUPABASE_ANON_KEY
    );
  }
  return _bcSupabase;
}

/* Fire-and-forget sync to the Google Sheets Apps Script Web App.
   Never blocks or throws — a failure here must never affect the
   primary Supabase write or the user's experience. */
function syncToSheets(payload) {
  const url = window.BC_CONFIG && window.BC_CONFIG.SHEETS_WEBAPP_URL;
  if (!url) return;
  fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }).catch(err => console.warn("Google Sheets sync failed (non-blocking):", err));
}
