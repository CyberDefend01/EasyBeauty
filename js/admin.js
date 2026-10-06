/* Admin Dashboard logic — guarded by Supabase Auth, reads users and
   feedback via RLS policies that only allow authenticated selects. */

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

  const [{ data: users, error: usersError }, { data: feedback, error: feedbackError }] = await Promise.all([
    supabase.from("users").select("*").order("created_at", { ascending: false }),
    supabase.from("feedback").select("*").order("created_at", { ascending: false })
  ]);

  if (usersError || feedbackError) {
    console.error(usersError || feedbackError);
    showError("Couldn't load dashboard data. Check that your Supabase RLS policies allow authenticated reads (see BEGINNER_SETUP_GUIDE.md).");
    return;
  }

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

  const usersBody = document.getElementById("usersTableBody");
  if (users.length) {
    usersBody.innerHTML = users.map(u => `
      <tr>
        <td>${escapeHTML(u.full_name)}</td>
        <td>${escapeHTML(u.email)}</td>
        <td>${escapeHTML(u.phone)}</td>
        <td><span class="tag-pill">${u.user_type === "professional" ? "Beauty Professional" : "Customer"}</span></td>
        <td>${formatDate(u.created_at)}</td>
      </tr>
    `).join("");
  } else {
    document.getElementById("usersEmptyState").style.display = "block";
  }

  const feedbackBody = document.getElementById("feedbackTableBody");
  if (feedback.length) {
    feedbackBody.innerHTML = feedback.map(f => `
      <tr>
        <td>${escapeHTML(f.name)}</td>
        <td><span class="tag-pill">${escapeHTML(f.feedback_type)}</span></td>
        <td>${"★".repeat(f.rating)}${"☆".repeat(5 - f.rating)}</td>
        <td class="wrap">${escapeHTML(f.comment)}</td>
        <td>${formatDate(f.created_at)}</td>
      </tr>
    `).join("");
  } else {
    document.getElementById("feedbackEmptyState").style.display = "block";
  }

  function requireExcel() {
    if (isExcelExportReady()) return true;
    alert("Excel export couldn't load (probably a network issue). Please check your internet connection and reload the page.");
    return false;
  }

  document.getElementById("exportUsersBtn").addEventListener("click", () => {
    if (!requireExcel()) return;
    downloadUsersExcel(users);
  });

  document.getElementById("exportFeedbackBtn").addEventListener("click", () => {
    if (!requireExcel()) return;
    downloadFeedbackExcel(feedback);
  });

  document.getElementById("exportAllBtn").addEventListener("click", () => {
    if (!requireExcel()) return;
    downloadAllDataExcel(users, feedback);
  });

  document.getElementById("loadingState").classList.add("hidden");
  document.getElementById("dashboardContent").classList.remove("hidden");
})();
