/* Give Feedback page logic — writes directly to Supabase (protected
   by RLS) and fires a non-blocking copy to Google Sheets. */

const feedbackForm = document.getElementById("feedbackForm");
const fbSubmitBtn = document.getElementById("fbSubmitBtn");
const fbFormError = document.getElementById("formError");
const fbStars = document.querySelectorAll("#starInput .star");
const fbRatingInput = document.getElementById("fbRating");

if (!isSupabaseConfigured()) {
  document.getElementById("configBanner").classList.remove("hidden");
}

function paintFbStars(value) {
  fbStars.forEach(s => s.classList.toggle("filled", Number(s.dataset.value) <= value));
}
paintFbStars(5);
fbStars.forEach(s => {
  s.addEventListener("click", () => {
    fbRatingInput.value = s.dataset.value;
    paintFbStars(Number(s.dataset.value));
  });
});

function showFbError(message) {
  fbFormError.textContent = message;
  fbFormError.classList.remove("hidden");
}

feedbackForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  fbFormError.classList.add("hidden");

  const supabase = getSupabase();
  if (!supabase) {
    showFbError("Feedback isn't connected to a database yet. Please try again later.");
    return;
  }

  const record = {
    name: document.getElementById("fbName").value.trim(),
    email: document.getElementById("fbEmail").value.trim() || null,
    phone: document.getElementById("fbPhone").value.trim() || null,
    feedback_type: document.getElementById("fbType").value,
    rating: Number(fbRatingInput.value),
    comment: document.getElementById("fbComment").value.trim()
  };

  fbSubmitBtn.disabled = true;
  fbSubmitBtn.textContent = "Submitting...";

  const { data, error } = await supabase
    .from("feedback")
    .insert(record)
    .select()
    .single();

  fbSubmitBtn.disabled = false;
  fbSubmitBtn.textContent = "Submit Feedback";

  if (error) {
    showFbError("Something went wrong submitting your feedback. Please try again.");
    console.error("Supabase feedback error:", error);
    return;
  }

  syncToSheets({
    type: "feedback",
    name: record.name,
    email: record.email || "",
    feedback_type: record.feedback_type,
    rating: record.rating,
    comment: record.comment,
    created_at: data.created_at
  });

  document.getElementById("formWrap").classList.add("hidden");
  document.getElementById("successWrap").classList.remove("hidden");
});
