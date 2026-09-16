/**
 * Paste this into Google Apps Script to receive RSVPs into a Google Sheet.
 * Step-by-step setup is in README.md, "Collect RSVPs in a Google Sheet".
 */

function doPost(e) {
  // Several guests can submit at the same moment and their appends would
  // race. Serialise them; give up after 20 seconds rather than hanging.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json({ ok: false, error: 'Server busy' });
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // First run: lay down the header row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Attending', 'Message']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),
      data.name || '',
      data.attending || '',
      data.message || '',
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Opening the /exec URL in a browser hits this, confirming the deployment. */
function doGet() {
  return json({ ok: true, message: 'RSVP endpoint is live' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
