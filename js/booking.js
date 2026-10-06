/* Booking Form logic */

const bookingProId = getQueryParam("id");
const bookingPro = getProfessional(bookingProId);

if (!bookingPro) {
  document.getElementById("bookingContent").classList.add("hidden");
  document.getElementById("notFound").classList.remove("hidden");
} else {
  document.title = `Book ${bookingPro.name} — EasyBeauty`;

  document.getElementById("proSummary").innerHTML =
    `Booking with <strong>${bookingPro.name}</strong> · ${bookingPro.service} · ${bookingPro.location} · ${priceRange(bookingPro)}`;

  const serviceSelectEl = document.getElementById("serviceRequired");
  serviceSelectEl.innerHTML = `<option value="${bookingPro.service}">${bookingPro.service}</option>`;

  // Prevent picking a date in the past
  document.getElementById("prefDate").min = new Date().toISOString().slice(0, 10);

  document.getElementById("bookingForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const booking = {
      proId: bookingPro.id,
      proName: bookingPro.name,
      customerName: document.getElementById("custName").value.trim(),
      phone: document.getElementById("custPhone").value.trim(),
      service: serviceSelectEl.value,
      date: document.getElementById("prefDate").value,
      time: document.getElementById("prefTime").value,
      notes: document.getElementById("custNotes").value.trim(),
      submittedAt: new Date().toISOString()
    };

    saveBooking(booking);
    sessionStorage.setItem("bc_last_booking", JSON.stringify(booking));
    window.location.href = "confirmation.html";
  });
}
