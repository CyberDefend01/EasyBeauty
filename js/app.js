/* EasyBeauty shared helpers */

function formatPrice(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}

function priceRange(p) {
  return `${formatPrice(p.priceMin)} - ${formatPrice(p.priceMax)}`;
}

function starString(rating) {
  const full = Math.round(rating * 2) / 2;
  let out = "";
  for (let i = 1; i <= 5; i++) {
    if (full >= i) out += "★";
    else if (full >= i - 0.5) out += "⯨";
    else out += "☆";
  }
  return out;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function getProfessional(id) {
  return PROFESSIONALS.find(p => p.id === id);
}

/* ---- Reviews: seed data + anything the visitor adds, kept in localStorage ---- */
function getReviews(proId) {
  const pro = getProfessional(proId);
  const seed = pro ? pro.reviews : [];
  const extra = JSON.parse(localStorage.getItem("bc_reviews_" + proId) || "[]");
  return [...extra, ...seed];
}

function addReview(proId, review) {
  const extra = JSON.parse(localStorage.getItem("bc_reviews_" + proId) || "[]");
  extra.unshift(review);
  localStorage.setItem("bc_reviews_" + proId, JSON.stringify(extra));
}

function averageRating(proId) {
  const reviews = getReviews(proId);
  if (!reviews.length) return 0;
  const sum = reviews.reduce((a, r) => a + Number(r.rating), 0);
  return sum / reviews.length;
}

/* ---- Bookings: stored locally to demonstrate the request flow ---- */
function saveBooking(booking) {
  const all = JSON.parse(localStorage.getItem("bc_bookings") || "[]");
  all.unshift(booking);
  localStorage.setItem("bc_bookings", JSON.stringify(all));
}

function whatsappLink(pro, message) {
  const text = encodeURIComponent(message || `Hi ${pro.name}, I found you on EasyBeauty and I'd like to book your ${pro.service.toLowerCase()} service.`);
  return `https://wa.me/${pro.whatsapp}?text=${text}`;
}

function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window._bcToastTimer);
  window._bcToastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

/* ---- Card renderer used on Home + Find pages ---- */
function proCardHTML(p) {
  const avg = averageRating(p.id) || p.rating;
  const reviewCount = getReviews(p.id).length;
  return `
    <div class="pro-card">
      <div class="pro-photo-wrap">
        <img src="${p.photo}" alt="${p.name}" loading="lazy">
        <span class="badge">${p.service}</span>
      </div>
      <div class="pro-body">
        <h3>${p.name}</h3>
        <div class="pro-loc">${p.location}</div>
        <div class="pro-price">${priceRange(p)}</div>
        <div class="pro-rating">${starString(avg)} <span class="count">${avg.toFixed(1)} (${reviewCount} review${reviewCount === 1 ? "" : "s"})</span></div>
        <a class="btn btn-primary btn-block" href="profile.html?id=${p.id}">View Profile</a>
      </div>
    </div>
  `;
}
