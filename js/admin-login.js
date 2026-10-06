/* Admin Login logic — Supabase Auth email/password sign-in.
   Create the admin user in Supabase Dashboard → Authentication →
   Users → Add user (see BEGINNER_SETUP_GUIDE.md). There is no public
   sign-up path for admin accounts. */

const loginForm = document.getElementById("loginForm");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const loginError = document.getElementById("loginError");

if (!isSupabaseConfigured()) {
  document.getElementById("configBanner").classList.remove("hidden");
} else {
  // Already signed in? Skip straight to the dashboard.
  getSupabase().auth.getSession().then(({ data }) => {
    if (data.session) window.location.href = "admin.html";
  });
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.classList.add("hidden");

  const supabase = getSupabase();
  if (!supabase) {
    loginError.textContent = "Admin login isn't connected to Supabase yet.";
    loginError.classList.remove("hidden");
    return;
  }

  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;

  loginSubmitBtn.disabled = true;
  loginSubmitBtn.textContent = "Signing in...";

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  loginSubmitBtn.disabled = false;
  loginSubmitBtn.textContent = "Sign In";

  if (error) {
    loginError.textContent = "Incorrect email or password.";
    loginError.classList.remove("hidden");
    return;
  }

  window.location.href = "admin.html";
});
