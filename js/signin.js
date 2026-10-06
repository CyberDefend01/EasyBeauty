/* Sign-in with email and password (Supabase Auth), plus a "forgot password"
   flow. Signed-in customers get no extra data access; admin rights come only
   from the admins table (see supabase/schema.sql). */

const views = {
  login: document.getElementById("viewLogin"),
  forgot: document.getElementById("viewForgot"),
  resetSent: document.getElementById("viewResetSent"),
  newPassword: document.getElementById("viewNewPassword"),
  signedIn: document.getElementById("viewSignedIn")
};

function showView(name) {
  Object.entries(views).forEach(([key, el]) => el.classList.toggle("hidden", key !== name));
}

function showError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.remove("hidden");
}

function hideError(id) {
  document.getElementById(id).classList.add("hidden");
}

function setBusy(btn, busy, idleLabel) {
  btn.disabled = busy;
  btn.textContent = busy ? "Please wait..." : idleLabel;
}

if (!isSupabaseConfigured()) {
  document.getElementById("configBanner").classList.remove("hidden");
  document.getElementById("loginSubmitBtn").disabled = true;
  showView("login");
} else {
  const supabase = getSupabase();
  let recoveryMode = false;

  async function refreshView() {
    if (recoveryMode) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      document.getElementById("signedInEmail").textContent = session.user.email;
      showView("signedIn");
    } else {
      showView("login");
    }
  }

  supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      recoveryMode = true;
      showView("newPassword");
      return;
    }
    refreshView();
  });
  refreshView();

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError("loginError");
    const btn = document.getElementById("loginSubmitBtn");
    setBusy(btn, true, "Sign In");

    const { error } = await supabase.auth.signInWithPassword({
      email: document.getElementById("loginEmail").value.trim().toLowerCase(),
      password: document.getElementById("loginPassword").value
    });

    setBusy(btn, false, "Sign In");
    if (error) {
      const msg = /not confirmed/i.test(error.message)
        ? "Please confirm your email first. Check your inbox for the confirmation link."
        : "Email or password is incorrect. Try again, or use Forgot your password.";
      showError("loginError", msg);
      return;
    }
    document.getElementById("loginPassword").value = "";
    refreshView();
  });

  document.getElementById("showForgotBtn").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("forgotEmail").value = document.getElementById("loginEmail").value;
    hideError("forgotError");
    showView("forgot");
  });

  document.getElementById("backToLoginBtn").addEventListener("click", (e) => {
    e.preventDefault();
    showView("login");
  });

  document.getElementById("resetDoneBtn").addEventListener("click", () => showView("login"));

  document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError("forgotError");
    const btn = document.getElementById("forgotSubmitBtn");
    const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
    setBusy(btn, true, "Send reset link");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("signin.html", window.location.href).href
    });

    setBusy(btn, false, "Send reset link");
    if (error && (error.status === 429 || /rate limit/i.test(error.message || ""))) {
      showError("forgotError", "Too many reset emails were sent recently. Please wait about an hour and try again.");
      return;
    }
    document.getElementById("resetSentTo").textContent = email;
    showView("resetSent");
  });

  document.getElementById("newPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError("newPasswordError");
    const password = document.getElementById("newPassword").value;
    if (password.length < 8) {
      showError("newPasswordError", "Please choose a password with at least 8 characters.");
      return;
    }
    const btn = document.getElementById("newPasswordBtn");
    setBusy(btn, true, "Save new password");

    const { error } = await supabase.auth.updateUser({ password });

    setBusy(btn, false, "Save new password");
    if (error) {
      showError("newPasswordError", "Couldn't save your new password. Please open the reset link again and retry.");
      return;
    }
    recoveryMode = false;
    document.getElementById("newPassword").value = "";
    refreshView();
  });

  document.getElementById("signOutBtn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    showView("login");
  });
}
