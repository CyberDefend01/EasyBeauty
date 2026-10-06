/**
 * EasyBeauty — Google Sheets sync
 *
 * This script belongs INSIDE the "EasyBeauty User Validation" Google
 * Sheet, as a bound Apps Script project (Extensions → Apps Script).
 * It receives sign-up and feedback rows from the website and appends
 * them to the matching tab. See SETUP_GUIDE.md for the full walkthrough
 * including how to deploy this as a Web App and get the URL that goes
 * into js/config.js as SHEETS_WEBAPP_URL.
 *
 * Expected sheet tabs (create these first, with header rows matching):
 *   "User Sign-Ups" — Full Name | Email | Phone Number | User Type | Date of Registration
 *   "Feedback"       — Name | Email | Feedback Type | Rating | Feedback/Comment | Date Submitted
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (payload.type === "signup") {
      var signupSheet = ss.getSheetByName("User Sign-Ups");
      if (!signupSheet) throw new Error('Missing "User Sign-Ups" tab');
      signupSheet.appendRow([
        payload.full_name || "",
        payload.email || "",
        payload.phone || "",
        payload.user_type === "professional" ? "Beauty Professional" : "Customer",
        payload.created_at || new Date().toISOString()
      ]);
    } else if (payload.type === "feedback") {
      var feedbackSheet = ss.getSheetByName("Feedback");
      if (!feedbackSheet) throw new Error('Missing "Feedback" tab');
      feedbackSheet.appendRow([
        payload.name || "",
        payload.email || "",
        payload.feedback_type || "",
        payload.rating || "",
        payload.comment || "",
        payload.created_at || new Date().toISOString()
      ]);
    } else {
      throw new Error("Unknown payload type: " + payload.type);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
