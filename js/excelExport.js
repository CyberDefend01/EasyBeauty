/* Excel (.xlsx) export helpers, built on the SheetJS library (loaded via
   CDN as the global `XLSX`). Used by the Admin Dashboard and by
   setup-check.html to confirm exporting works. No data ever leaves the
   browser — the file is generated and downloaded locally. */

function isExcelExportReady() {
  try {
    if (typeof XLSX === "undefined") return false;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([["ok"]]);
    XLSX.utils.book_append_sheet(wb, ws, "Test");
    return true;
  } catch (err) {
    console.error("Excel export self-test failed:", err);
    return false;
  }
}

function rowsToSheet(rows, columns) {
  const header = columns.map(c => c.label);
  const body = rows.map(r => columns.map(c => c.get(r)));
  return XLSX.utils.aoa_to_sheet([header, ...body]);
}

const USERS_COLUMNS = [
  { label: "Full Name", get: u => u.full_name },
  { label: "Email", get: u => u.email },
  { label: "Phone", get: u => u.phone },
  { label: "User Type", get: u => (u.user_type === "professional" ? "Beauty Professional" : "Customer") },
  { label: "Registration Date", get: u => new Date(u.created_at).toLocaleString("en-NG") }
];

const FEEDBACK_COLUMNS = [
  { label: "Name", get: f => f.name },
  { label: "Email", get: f => f.email || "" },
  { label: "Feedback Type", get: f => f.feedback_type },
  { label: "Rating", get: f => f.rating },
  { label: "Feedback / Comment", get: f => f.comment },
  { label: "Date Submitted", get: f => new Date(f.created_at).toLocaleString("en-NG") }
];

function downloadUsersExcel(users) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, rowsToSheet(users, USERS_COLUMNS), "Users");
  XLSX.writeFile(wb, `easybeauty-users-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function downloadFeedbackExcel(feedback) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, rowsToSheet(feedback, FEEDBACK_COLUMNS), "Feedback");
  XLSX.writeFile(wb, `easybeauty-feedback-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function downloadAllDataExcel(users, feedback) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, rowsToSheet(users, USERS_COLUMNS), "Users");
  XLSX.utils.book_append_sheet(wb, rowsToSheet(feedback, FEEDBACK_COLUMNS), "Feedback");
  XLSX.writeFile(wb, `easybeauty-validation-data-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
