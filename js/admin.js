/* Admin Dashboard logic — guarded by Supabase Auth, reads/deletes users
   and feedback via RLS policies that only allow it for admins. */

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
}

function showError(message) {
  document.getElementById("loadingState").classList.add("hidden");
  document.getElementById("dashboardContent").classList.add("hidden");
  document.getElementById("errorState").classList.remove("hidden");
  document.getElementById("errorMessage").textContent = message;
}

(async function init() {
  if (!isSupabaseConfigured()) {
    showError("Supabase isn't configured yet. See BEGINNER_SETUP_GUIDE.md to connect the admin dashboard.");
    return;
  }

  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "admin-login.html";
    return;
  }

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "admin-login.html";
  });

  const { data: isAdmin, error: adminCheckError } = await supabase.rpc("is_admin");
  if (adminCheckError) {
    console.error("Admin check error:", adminCheckError);
    showError(`The admin check failed: ${adminCheckError.message}. The database setup (BEGINNER_SETUP_GUIDE.md, Step 5) may not have finished.`);
    return;
  }
  if (!isAdmin) {
    showError(`${session.user.email} doesn't have admin access. Add this exact email to the admins table (BEGINNER_SETUP_GUIDE.md, Step 5b), then log out and back in.`);
    return;
  }

  const [{ data: usersData, error: usersError }, { data: feedbackData, error: feedbackError }] = await Promise.all([
    supabase.from("users").select("*").order("created_at", { ascending: false }),
    supabase.from("feedback").select("*").order("created_at", { ascending: false })
  ]);

  if (usersError || feedbackError) {
    console.error(usersError || feedbackError);
    showError("Couldn't load dashboard data. Check that your Supabase RLS policies allow authenticated reads (see BEGINNER_SETUP_GUIDE.md).");
    return;
  }

  let users = usersData;
  let feedback = feedbackData;

  function renderStats() {
    const customers = users.filter(u => u.user_type === "customer");
    const professionals = users.filter(u => u.user_type === "professional");
    const avgRating = feedback.length
      ? (feedback.reduce((sum, f) => sum + Number(f.rating), 0) / feedback.length).toFixed(1)
      : "—";

    document.getElementById("statTotalUsers").textContent = users.length;
    document.getElementById("statCustomers").textContent = customers.length;
    document.getElementById("statProfessionals").textContent = professionals.length;
    document.getElementById("statFeedback").textContent = feedback.length;
    document.getElementById("statAvgRating").textContent = avgRating;
  }

  function renderUsers() {
    const usersBody = document.getElementById("usersTableBody");
    const emptyState = document.getElementById("usersEmptyState");
    if (users.length) {
      emptyState.style.display = "none";
      usersBody.innerHTML = users.map(u => `
        <tr>
          <td>${escapeHTML(u.full_name)}</td>
          <td>${escapeHTML(u.email)}</td>
          <td>${escapeHTML(u.phone)}</td>
          <td><span class="tag-pill">${u.user_type === "professional" ? "Beauty Professional" : "Customer"}</span></td>
          <td>${formatDate(u.created_at)}</td>
          <td><button class="btn-danger-text" type="button" data-delete-user="${u.id}">Delete</button></td>
        </tr>
      `).join("");
    } else {
      usersBody.innerHTML = "";
      emptyState.style.display = "block";
    }
  }

  function renderFeedback() {
    const feedbackBody = document.getElementById("feedbackTableBody");
    const emptyState = document.getElementById("feedbackEmptyState");
    if (feedback.length) {
      emptyState.style.display = "none";
      feedbackBody.innerHTML = feedback.map(f => `
        <tr>
          <td>${escapeHTML(f.name)}</td>
          <td><span class="tag-pill">${escapeHTML(f.feedback_type)}</span></td>
          <td>${"★".repeat(f.rating)}${"☆".repeat(5 - f.rating)}</td>
          <td class="wrap">${escapeHTML(f.comment)}</td>
          <td>${formatDate(f.created_at)}</td>
          <td><button class="btn-danger-text" type="button" data-delete-feedback="${f.id}">Delete</button></td>
        </tr>
      `).join("");
    } else {
      feedbackBody.innerHTML = "";
      emptyState.style.display = "block";
    }
  }

  document.getElementById("usersTableBody").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-delete-user]");
    if (!btn) return;
    const id = btn.dataset.deleteUser;
    const row = users.find(u => u.id === id);
    if (!confirm(`Delete the sign-up for ${row ? row.full_name : "this user"}? This can't be undone.`)) return;

    btn.disabled = true;
    btn.textContent = "Deleting...";
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      alert("Couldn't delete: " + error.message);
      btn.disabled = false;
      btn.textContent = "Delete";
      return;
    }
    users = users.filter(u => u.id !== id);
    renderStats();
    renderUsers();
  });

  document.getElementById("feedbackTableBody").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-delete-feedback]");
    if (!btn) return;
    const id = btn.dataset.deleteFeedback;
    const row = feedback.find(f => f.id === id);
    if (!confirm(`Delete this feedback from ${row ? row.name : "this person"}? This can't be undone.`)) return;

    btn.disabled = true;
    btn.textContent = "Deleting...";
    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (error) {
      alert("Couldn't delete: " + error.message);
      btn.disabled = false;
      btn.textContent = "Delete";
      return;
    }
    feedback = feedback.filter(f => f.id !== id);
    renderStats();
    renderFeedback();
  });

  function requireExcel() {
    if (isExcelExportReady()) return true;
    alert("Excel export couldn't load (probably a network issue). Please check your internet connection and reload the page.");
    return false;
  }

  // Masking only changes what's written into the downloaded file — the
  // on-screen table always shows real emails.
  function askToMaskEmails() {
    return confirm("Mask part of each email in this export? (e.g. am***@gmail.com)\n\nOK = mask emails\nCancel = export full emails");
  }

  document.getElementById("exportUsersBtn").addEventListener("click", () => {
    if (!requireExcel()) return;
    downloadUsersExcel(users, askToMaskEmails());
  });

  document.getElementById("exportFeedbackBtn").addEventListener("click", () => {
    if (!requireExcel()) return;
    downloadFeedbackExcel(feedback, askToMaskEmails());
  });

  document.getElementById("exportAllBtn").addEventListener("click", () => {
    if (!requireExcel()) return;
    downloadAllDataExcel(users, feedback, askToMaskEmails());
  });

  renderStats();
  renderUsers();
  renderFeedback();

  document.getElementById("loadingState").classList.add("hidden");
  document.getElementById("dashboardContent").classList.remove("hidden");
})();
