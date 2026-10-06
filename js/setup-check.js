/* Setup Check — verifies the Supabase connection, tables, RLS policies
   and Excel export, WITHOUT ever creating real sign-up/feedback rows.
   The "can a test signup/feedback be submitted" checks call Postgres
   functions (check_users_insert / check_feedback_insert, defined in
   supabase/schema.sql) that insert a throwaway row and then force a
   rollback before returning — nothing is ever actually kept. */

const resultsEl = document.getElementById("checkResults");
const summaryEl = document.getElementById("summaryBanner");
const runBtn = document.getElementById("runChecksBtn");

const ICONS = { ok: "✅", fail: "❌", warn: "⚠️", pending: "⏳" };

function renderResults(items) {
  resultsEl.innerHTML = items.map(item => `
    <div class="check-item check-${item.status}">
      <div class="check-icon">${ICONS[item.status]}</div>
      <div class="check-body">
        <div class="check-title">${item.title}</div>
        <div class="check-detail">${item.detail}</div>
      </div>
    </div>
  `).join("");
}

function renderSummary(items) {
  const hasFail = items.some(i => i.status === "fail");
  const hasWarn = items.some(i => i.status === "warn");
  const hasPending = items.some(i => i.status === "pending");

  if (hasPending) {
    summaryEl.className = "banner banner-warn";
    summaryEl.textContent = "Running checks...";
  } else if (hasFail) {
    summaryEl.className = "banner banner-error";
    summaryEl.textContent = "Some checks failed. Fix the ❌ items below using BEGINNER_SETUP_GUIDE.md, then run checks again.";
  } else if (hasWarn) {
    summaryEl.className = "banner banner-warn";
    summaryEl.textContent = "Mostly working — check the ⚠️ items below.";
  } else {
    summaryEl.className = "banner banner-ok";
    summaryEl.textContent = "Everything is working! Sign-ups, feedback, the Admin Dashboard and Excel export are all connected correctly.";
  }
}

async function fetchWithTimeout(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function checkConnection() {
  if (!isSupabaseConfigured()) {
    return {
      status: "fail",
      title: "Is Supabase connected?",
      detail: 'Your Supabase URL and key aren\'t set yet. Open <code>js/config.js</code> and paste them in — see BEGINNER_SETUP_GUIDE.md, Step 9.'
    };
  }
  try {
    const res = await fetchWithTimeout(
      window.BC_CONFIG.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/",
      { headers: { apikey: window.BC_CONFIG.SUPABASE_ANON_KEY } },
      8000
    );
    if (res.status === 401 || res.status === 403) {
      return {
        status: "fail",
        title: "Is Supabase connected?",
        detail: "Supabase rejected your anon key. Double-check SUPABASE_ANON_KEY in js/config.js matches Project Settings → API exactly."
      };
    }
    return {
      status: "ok",
      title: "Is Supabase connected?",
      detail: "Successfully reached your Supabase project."
    };
  } catch (err) {
    return {
      status: "fail",
      title: "Is Supabase connected?",
      detail: "Couldn't reach your Supabase project. Double-check SUPABASE_URL in js/config.js and your internet connection."
    };
  }
}

async function checkTable(tableName, label) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from(tableName).select("id").limit(1);

  if (error && error.code === "42P01") {
    return {
      status: "fail",
      title: `Is the ${label} table available?`,
      detail: `The ${tableName} table doesn't exist yet. Go back to Step 5 and run the SQL in your Supabase SQL Editor.`
    };
  }
  if (error) {
    return {
      status: "fail",
      title: `Is the ${label} table available?`,
      detail: `Unexpected error checking ${tableName}: ${error.message}`
    };
  }
  if (data && data.length > 0) {
    return {
      status: "warn",
      title: `Is the ${label} table available?`,
      detail: `The ${tableName} table exists, but records can be read without logging in. Check the RLS "select" policies (Step 5 and Step 12).`
    };
  }
  return {
    status: "ok",
    title: `Is the ${label} table available?`,
    detail: `The ${tableName} table exists and is protected — the public can't read anyone's records.`
  };
}

async function checkInsert(rpcName, label) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc(rpcName);

  if (error) {
    const missingFn = /function .* does not exist/i.test(error.message || "");
    return {
      status: "fail",
      title: label,
      detail: missingFn
        ? "The setup-check SQL functions are missing. Re-copy the full SQL from Step 5 (it includes them) and run it again."
        : `Insert check failed: ${error.message}. Check the "Public can sign up / submit feedback" RLS policy from Step 5.`
    };
  }
  return {
    status: data === true ? "ok" : "fail",
    title: label,
    detail: data === true
      ? "A test record was created and safely rolled back automatically — nothing was kept."
      : "The check ran but didn't confirm success. Try again, or re-check the SQL from Step 5."
  };
}

async function checkAdminDashboard() {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return {
      status: "warn",
      title: "Can the admin dashboard retrieve data?",
      detail: 'Not tested yet — <a href="admin-login.html">log in to the Admin Dashboard</a> first, then come back and run checks again.'
    };
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) {
    return {
      status: "fail",
      title: "Can the admin dashboard retrieve data?",
      detail: `Couldn't check admin access: ${adminError.message}. Make sure supabase/migration-signin.sql was run (Step 12).`
    };
  }
  if (!isAdmin) {
    return {
      status: "fail",
      title: "Can the admin dashboard retrieve data?",
      detail: `You're signed in as ${session.user.email}, but this email isn't in the admins table. Complete Step 12 with your admin email.`
    };
  }

  const [{ error: usersError }, { error: feedbackError }] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("feedback").select("id", { count: "exact", head: true })
  ]);

  if (usersError || feedbackError) {
    return {
      status: "fail",
      title: "Can the admin dashboard retrieve data?",
      detail: `Logged in, but reading data failed: ${(usersError || feedbackError).message}`
    };
  }
  return {
    status: "ok",
    title: "Can the admin dashboard retrieve data?",
    detail: "You're logged in as admin and the dashboard can read both tables."
  };
}

function checkExcel() {
  return {
    status: isExcelExportReady() ? "ok" : "fail",
    title: "Is Excel export working?",
    detail: isExcelExportReady()
      ? "The Excel export library loaded correctly — downloads from the Admin Dashboard will work."
      : "The Excel export library failed to load. Check your internet connection and reload this page."
  };
}

async function runAllChecks() {
  runBtn.disabled = true;
  runBtn.textContent = "Running...";

  const pendingTitles = [
    "Is Supabase connected?",
    "Is the users table available?",
    "Is the feedback table available?",
    "Can a test signup be submitted?",
    "Can feedback be submitted?",
    "Can the admin dashboard retrieve data?",
    "Is Excel export working?"
  ];
  let items = pendingTitles.map(title => ({ status: "pending", title, detail: "Checking..." }));
  renderResults(items);
  renderSummary(items);

  const connection = await checkConnection();
  items[0] = connection;
  renderResults(items);

  if (connection.status === "fail") {
    // No point running the rest if we can't even reach Supabase.
    for (let i = 1; i < items.length - 1; i++) {
      items[i] = { status: "fail", title: pendingTitles[i], detail: "Skipped — fix the connection check above first." };
    }
    items[items.length - 1] = checkExcel();
    renderResults(items);
    renderSummary(items);
    runBtn.disabled = false;
    runBtn.textContent = "Run Checks Again";
    return;
  }

  const [usersTable, feedbackTable, usersInsert, feedbackInsert, adminCheck] = await Promise.all([
    checkTable("users", "users"),
    checkTable("feedback", "feedback"),
    checkInsert("check_users_insert", "Can a test signup be submitted?"),
    checkInsert("check_feedback_insert", "Can feedback be submitted?"),
    checkAdminDashboard()
  ]);

  items[1] = usersTable;
  items[2] = feedbackTable;
  items[3] = usersInsert;
  items[4] = feedbackInsert;
  items[5] = adminCheck;
  items[6] = checkExcel();

  renderResults(items);
  renderSummary(items);

  runBtn.disabled = false;
  runBtn.textContent = "Run Checks Again";
}

runBtn.addEventListener("click", runAllChecks);
runAllChecks();
