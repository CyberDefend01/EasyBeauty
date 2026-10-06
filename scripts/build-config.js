// Writes js/config.js from environment variables at deploy time (Vercel).
// Run locally with no variables set and it does nothing, so your local config.js is kept.
const fs = require("fs");
const path = require("path");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  if (process.env.VERCEL) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY. Add them in Vercel → Settings → Environment Variables.");
    process.exit(1);
  }
  console.log("No SUPABASE_URL / SUPABASE_ANON_KEY set; leaving js/config.js unchanged.");
  process.exit(0);
}

const out = `/* Generated at deploy time by scripts/build-config.js. Do not edit. */
window.BC_CONFIG = {
  SUPABASE_URL: ${JSON.stringify(url)},
  SUPABASE_ANON_KEY: ${JSON.stringify(key)},
  SHEETS_WEBAPP_URL: ${JSON.stringify(process.env.SHEETS_WEBAPP_URL || "")}
};
`;

fs.writeFileSync(path.join(__dirname, "..", "js", "config.js"), out);
console.log("Wrote js/config.js from environment variables.");
