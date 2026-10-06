# EasyBeauty — MVP

A simple, mobile-first marketplace MVP that helps customers discover, compare and book beauty professionals (hairstylists, makeup artists, nail technicians, lash technicians), starting with a Gombe State, Nigeria pilot. It also collects real sign-ups and feedback in Supabase as customer-validation evidence, downloadable as Excel from a private Admin Dashboard.

## Run it

No build step, no dependencies. Just serve the folder statically:

```bash
cd EasyBeauty
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser (or on your phone via your computer's local IP for a real mobile test).

Opening `index.html` directly by double-clicking also works in most browsers, but a local server is recommended so relative fetches behave consistently.

**To collect real sign-ups and feedback**, follow [BEGINNER_SETUP_GUIDE.md](BEGINNER_SETUP_GUIDE.md) — a complete, no-experience-needed walkthrough (~15 minutes). Until you do, the Sign Up and Feedback pages show a small "not connected yet" notice instead of breaking, and everything else on the site works normally. Once connected, open `setup-check.html` any time to confirm it's all wired up correctly.

## Structure

```
index.html            Home (with "Join EasyBeauty" CTA)
find.html              Find a Beauty Professional (search + filters)
profile.html            Professional Profile (?id=<professional-id>)
booking.html            Booking Form (?id=<professional-id>)
confirmation.html       Booking Confirmation (+ "Give Feedback" prompt)
about.html              About EasyBeauty
signup.html             Sign Up — saves to Supabase
signin.html             Sign In — emailed link for customers and professionals
feedback.html           Give Feedback — saves to Supabase
admin-login.html        Admin sign-in (Supabase Auth)
admin.html              Admin Dashboard — stats, tables, Excel export
setup-check.html        Self-check that Supabase/dashboard/Excel are working

css/style.css           Shared design system
js/data.js              Sample professional data (10 profiles, Gombe State)
js/app.js               Shared helpers (ratings, reviews, bookings, WhatsApp links)
js/find.js              Search/filter logic
js/profile.js           Profile rendering + per-professional review submission
js/booking.js           Booking form submission
js/confirmation.js      Confirmation page rendering
js/config.js            Your real Supabase settings (gitignored)
js/config.example.js    Template for config.js
js/supabaseClient.js    Supabase client init + optional Sheets sync helper
js/excelExport.js       Builds .xlsx files for the Admin Dashboard
js/signup.js            Sign-up form logic
js/feedback.js          Feedback form logic
js/admin-login.js       Admin login logic
js/admin.js             Admin dashboard logic (stats, tables, Excel export)
js/setup-check.js       Setup Check page logic

supabase/schema.sql             Database tables, Row Level Security policies, and safe setup-check functions
supabase/migration-signin.sql   Admin list + admin-only read rules (BEGINNER_SETUP_GUIDE.md, Step 12)
google-apps-script/Code.gs      Optional: Apps Script that mirrors rows into Google Sheets
BEGINNER_SETUP_GUIDE.md         Start here — the only guide you need
SETUP_GUIDE.md                  Optional/advanced: turning on the Google Sheets mirror
```

## How it's stored

Two independent storage layers, kept intentionally separate:

- **Bookings and per-professional star reviews** (the original MVP feature, e.g. "leave a review" on a professional's profile) are demo data saved in the browser's `localStorage`/`sessionStorage`, keyed per professional. No setup needed.
- **Platform sign-ups and site-wide feedback** (the `signup.html` / `feedback.html` forms, used as Founders Lab validation evidence) are saved permanently to **Supabase** (Postgres) — the real, persistent database. View and download them from the Admin Dashboard as Excel (`.xlsx`) files. A Google Sheets mirror is available but entirely optional (see `SETUP_GUIDE.md`) — the site works fully without it.

Swapping the demo `localStorage` layer for a real API later just means replacing the relevant functions in `js/app.js`.

## Demo data vs. real data

The 10 sample beauty professionals in `js/data.js` are demo/placeholder data for showing off the marketplace experience — that's expected for an MVP demo. **Sign-ups and feedback are never seeded or faked**: every row in the `users` and `feedback` Supabase tables comes only from someone actually submitting the real forms, which is what makes them usable as validation evidence.
