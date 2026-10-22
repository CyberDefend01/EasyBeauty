/* Join the Waitlist — lighter-weight than Sign Up: no password, no
   login required. Writes directly to Supabase (protected by RLS). */

const waitlistForm = document.getElementById("waitlistForm");
const waitlistSubmitBtn = document.getElementById("waitlistSubmitBtn");
const formError = document.getElementById("formError");

if (!isSupabaseConfigured()) {
  document.getElementById("configBanner").classList.remove("hidden");
}

function showFormError(message) {
  formError.textContent = message;
  formError.classList.remove("hidden");
}

waitlistForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.classList.add("hidden");

  const supabase = getSupabase();
  if (!supabase) {
    showFormError("The waitlist isn't connected to a database yet. Please try again later.");
    return;
  }

  const record = {
    full_name: document.getElementById("wFullName").value.trim(),
    email: document.getElementById("wEmail").value.trim().toLowerCase(),
    phone: document.getElementById("wPhone").value.trim() || null,
    user_type: document.getElementById("wUserType").value
  };

  waitlistSubmitBtn.disabled = true;
  waitlistSubmitBtn.textContent = "Joining...";

  const { error } = await supabase.from("waitlist").insert(record);

  waitlistSubmitBtn.disabled = false;
  waitlistSubmitBtn.textContent = "Join the Waitlist";

  if (error) {
    if (error.code === "23505") {
      showFormError("This email is already on the waitlist.");
    } else {
      showFormError("Something went wrong saving your details. Please try again.");
      console.error("Supabase waitlist error:", error);
    }
    return;
  }

  syncToSheets({
    type: "waitlist",
    full_name: record.full_name,
    email: record.email,
    phone: record.phone || "",
    user_type: record.user_type,
    created_at: new Date().toISOString()
  });

  document.getElementById("successMessage").textContent = record.user_type === "professional"
    ? "Thanks for joining — we'll reach out as soon as EasyBeauty is onboarding professionals in your area."
    : "Thanks for joining — we'll reach out as soon as EasyBeauty is ready for you.";

  document.getElementById("formWrap").classList.add("hidden");
  document.getElementById("successWrap").classList.remove("hidden");
});
