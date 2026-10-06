/* Sign Up page logic — creates a password login (Supabase Auth), saves the
   profile to the users table, and fires a non-blocking copy to Google Sheets. */

const signupForm = document.getElementById("signupForm");
const signupSubmitBtn = document.getElementById("signupSubmitBtn");
const formError = document.getElementById("formError");

if (!isSupabaseConfigured()) {
  document.getElementById("configBanner").classList.remove("hidden");
}

function showFormError(message) {
  formError.textContent = message;
  formError.classList.remove("hidden");
}

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.classList.add("hidden");

  const supabase = getSupabase();
  if (!supabase) {
    showFormError("Sign-ups aren't connected to a database yet. Please try again later.");
    return;
  }

  const password = document.getElementById("password").value;
  if (password.length < 8) {
    showFormError("Please choose a password with at least 8 characters.");
    return;
  }

  const record = {
    full_name: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim().toLowerCase(),
    phone: document.getElementById("phone").value.trim(),
    user_type: document.getElementById("userType").value
  };

  signupSubmitBtn.disabled = true;
  signupSubmitBtn.textContent = "Creating account...";

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: record.email,
    password,
    options: { emailRedirectTo: new URL("signin.html", window.location.href).href }
  });

  if (authError) {
    signupSubmitBtn.disabled = false;
    signupSubmitBtn.textContent = "Create Account";
    if (/already (registered|been registered|exists)/i.test(authError.message || "")) {
      showFormError("This email already has an account. Sign in instead with your password.");
    } else {
      showFormError("Couldn't create your login: " + authError.message);
      console.error("Supabase auth signup error:", authError);
    }
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .insert(record)
    .select()
    .single();

  signupSubmitBtn.disabled = false;
  signupSubmitBtn.textContent = "Create Account";

  if (error) {
    if (error.code === "23505") {
      showFormError("This email is already registered. Sign in instead with your password.");
    } else {
      showFormError("Something went wrong saving your details. Please try again.");
      console.error("Supabase signup error:", error);
    }
    return;
  }

  syncToSheets({
    type: "signup",
    full_name: record.full_name,
    email: record.email,
    phone: record.phone,
    user_type: record.user_type,
    created_at: data.created_at
  });

  const welcome = record.user_type === "professional"
    ? "Your professional account has been created. Our team will reach out about listing your services."
    : "Your account has been created. You're ready to find and book trusted beauty professionals.";
  document.getElementById("successMessage").textContent = authData.session
    ? welcome
    : welcome + " Check your email to confirm your address, then sign in.";

  document.getElementById("formWrap").classList.add("hidden");
  document.getElementById("successWrap").classList.remove("hidden");
});
