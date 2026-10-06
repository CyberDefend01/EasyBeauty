/* Booking Confirmation page logic */

const lastBookingRaw = sessionStorage.getItem("bc_last_booking");

if (!lastBookingRaw) {
  document.getElementById("noBooking").classList.remove("hidden");
} else {
  const booking = JSON.parse(lastBookingRaw);
  const pro = getProfessional(booking.proId);

  document.getElementById("confirmContent").classList.remove("hidden");
  document.getElementById("cName").textContent = booking.customerName;
  document.getElementById("cPro").textContent = booking.proName;
  document.getElementById("cService").textContent = booking.service;
  document.getElementById("cDateTime").textContent = `${booking.date} at ${booking.time}`;
  document.getElementById("cPhone").textContent = booking.phone;

  if (pro) {
    const msg = `Hi ${pro.name}, I just requested a booking on EasyBeauty for ${booking.service} on ${booking.date} at ${booking.time}. My name is ${booking.customerName}.`;
    document.getElementById("cWhatsapp").href = whatsappLink(pro, msg);
  } else {
    document.getElementById("cWhatsapp").classList.add("hidden");
  }

  sessionStorage.removeItem("bc_last_booking");
}
