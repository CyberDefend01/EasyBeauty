/* Professional Profile page logic */

const proId = getQueryParam("id");
const pro = getProfessional(proId);

if (!pro) {
  document.getElementById("profileContent").classList.add("hidden");
  document.getElementById("notFound").classList.remove("hidden");
} else {
  document.title = `${pro.name} — EasyBeauty`;

  document.getElementById("proPhoto").src = pro.photo;
  document.getElementById("proPhoto").alt = pro.name;
  document.getElementById("proService").textContent = pro.service;
  document.getElementById("proName").textContent = pro.name;
  document.getElementById("proLocation").textContent = "📍 " + pro.location;
  document.getElementById("proPrice").textContent = priceRange(pro);
  document.getElementById("proDescription").textContent = pro.description;

  document.getElementById("bookNowBtn").href = `booking.html?id=${pro.id}`;
  document.getElementById("whatsappBtn").href = whatsappLink(pro);

  document.getElementById("proGallery").innerHTML = pro.portfolio
    .map(src => `<img src="${src}" alt="${pro.name} portfolio work" loading="lazy">`)
    .join("");

  function renderRating() {
    const avg = averageRating(pro.id) || pro.rating;
    const reviews = getReviews(pro.id);
    document.getElementById("proRating").textContent =
      `${starString(avg)} ${avg.toFixed(1)} (${reviews.length} review${reviews.length === 1 ? "" : "s"})`;
    return reviews;
  }

  function renderReviews() {
    const reviews = renderRating();
    const list = document.getElementById("reviewsList");
    if (!reviews.length) {
      list.innerHTML = `<p class="center" style="margin:0;">No reviews yet. Be the first to share your experience!</p>`;
      return;
    }
    list.innerHTML = reviews.map(r => `
      <div class="review">
        <div class="review-head">
          <strong>${escapeHTML(r.name)}</strong>
          <span class="review-stars">${starString(r.rating)}</span>
        </div>
        <div class="review-date">${r.date}</div>
        <p>${escapeHTML(r.comment)}</p>
      </div>
    `).join("");
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  renderReviews();

  // ---- Review form ----
  const reviewFormCard = document.getElementById("reviewFormCard");
  const showBtn = document.getElementById("showReviewFormBtn");
  const cancelBtn = document.getElementById("cancelReviewBtn");
  const form = document.getElementById("reviewForm");
  const stars = document.querySelectorAll("#starInput .star");
  const ratingInput = document.getElementById("reviewRating");

  function paintStars(value) {
    stars.forEach(s => {
      s.classList.toggle("filled", Number(s.dataset.value) <= value);
    });
  }
  paintStars(5);

  stars.forEach(s => {
    s.addEventListener("click", () => {
      ratingInput.value = s.dataset.value;
      paintStars(Number(s.dataset.value));
    });
  });

  showBtn.addEventListener("click", () => {
    reviewFormCard.classList.remove("hidden");
    showBtn.classList.add("hidden");
    document.getElementById("reviewerName").focus();
  });
  cancelBtn.addEventListener("click", () => {
    reviewFormCard.classList.add("hidden");
    showBtn.classList.remove("hidden");
    form.reset();
    paintStars(5);
    ratingInput.value = 5;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reviewerName").value.trim();
    const comment = document.getElementById("reviewComment").value.trim();
    const rating = Number(ratingInput.value);
    if (!name || !comment) return;

    addReview(pro.id, {
      name,
      rating,
      comment,
      date: new Date().toISOString().slice(0, 10)
    });

    form.reset();
    paintStars(5);
    ratingInput.value = 5;
    reviewFormCard.classList.add("hidden");
    showBtn.classList.remove("hidden");
    renderReviews();
    toast("Thank you! Your review has been posted.");
  });
}
