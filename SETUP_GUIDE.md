# EasyBeauty — Advanced Setup: Optional Google Sheets Sync

**Most people don't need this file.** For the core setup (Supabase
database + Admin Dashboard + Excel export), follow
[BEGINNER_SETUP_GUIDE.md](BEGINNER_SETUP_GUIDE.md) instead — it's simpler,
self-contained, and everything works fully without Google Sheets.

This file covers the one *optional* extra: automatically mirroring every
sign-up and feedback submission into a Google Sheet, in addition to
Supabase. Some founders like having a spreadsheet copy to skim or share
without logging into the Admin Dashboard. It adds no new risk to the core
site — if it's ever misconfigured or unreachable, sign-ups and feedback
still save to Supabase exactly as normal; the Sheets copy is a bonus, never
a dependency. The Admin Dashboard's **Export to Excel** buttons already
give you a downloadable spreadsheet straight from Supabase, so treat this
as a "nice to have," not a requirement.

---

## How it works

This uses a **Google Apps Script Web App** bound to a spreadsheet — no
Google Cloud project, service account, or API keys needed. The website
sends a "fire and forget" request to it after every successful Supabase
save; it never blocks the page or shows an error to the visitor if it
fails.

## 1. Create the spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**.
2. Rename it exactly: **EasyBeauty User Validation**.
3. Rename the first tab (bottom-left) to **User Sign-Ups**. Add this header
   row:

   ```
   Full Name | Email | Phone Number | User Type | Date of Registration
   ```

4. Add a second tab named **Feedback**. Add this header row:

   ```
   Name | Email | Feedback Type | Rating | Feedback/Comment | Date Submitted
   ```

## 2. Add the sync script

1. In the spreadsheet, go to **Extensions → Apps Script**.
2. Delete the placeholder code and paste in the contents of
   [`google-apps-script/Code.gs`](google-apps-script/Code.gs) from this
   project.
3. Click **Save** (the disk icon), name the project e.g. `EasyBeauty Sync`.

## 3. Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → **Web app**.
3. Settings:
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
4. Click **Deploy**, then **Authorize access** and approve the permissions
   (you'll see a Google "unverified app" warning — click **Advanced →
   Go to [project name] (unsafe)**; this is expected for a script you
   wrote yourself and only your spreadsheet trusts it).
5. Copy the **Web app URL** it gives you (ends in `/exec`).

## 4. Wire it into the site

Open `js/config.js` and paste that URL in:

```js
SHEETS_WEBAPP_URL: "https://script.google.com/macros/s/AKfycb.../exec"
```

## 5. Test it

1. Submit a real test sign-up on `signup.html`.
2. Check the **User Sign-Ups** tab in your Google Sheet — a new row should
   appear within a few seconds.
3. Submit a real test entry on `feedback.html` and confirm it lands in the
   **Feedback** tab.

## Turning it off again

Clear `SHEETS_WEBAPP_URL` back to `""` in `js/config.js`. Nothing else
changes — Supabase remains the database either way.

## Downloading the Google Sheet as Excel

If you do use this, you can also download the Sheet directly: open it at
[sheets.google.com](https://sheets.google.com) → **File → Download →
Microsoft Excel (.xlsx)**.

---

## Deployment

This is a static site (no build step), so any static host works:

- **Netlify / Vercel**: drag-and-drop the project folder, or connect a git
  repo. Set the publish directory to the project root.
- **GitHub Pages**: push to a repo and enable Pages on the `main` branch.

Whichever you use, remember `js/config.js` is gitignored, so it won't come
along automatically if you push to git — either commit a version with real
values in a private repo, or use your host's file upload step to add it at
deploy time.
