/**
 * Paste this into Google Apps Script to receive RSVPs into a Google Sheet.
 * Step-by-step setup is in README.md, "Collect RSVPs in a Google Sheet".
 *
 * The sheet formats itself: a gold header, column widths that fit the
 * content, and each row tinted by whether the guest is coming.
 */

// Id is last so it can be appended to a sheet written by an older version.
// It exists to make retries safe: the same submission never lands twice.
var HEADERS = ['Timestamp', 'Name', 'Attending', 'Time slots', 'Message', 'Id'];

/** Pixel widths per column, in the same order as HEADERS. */
var WIDTHS = [150, 190, 150, 210, 340, 250];

var COLOURS = {
  header: '#b8944f',      // gold, same as the invitation
  headerText: '#ffffff',
  coming: '#eef4ea',      // soft green
  notComing: '#faefe9',   // soft clay
  border: '#e2d9c9',
};

/**
 * A reply counts as a decline when it contains one of these.
 * Edit this if you reword `rsvp.attendingOptions` in the site content.
 */
var DECLINE_WORDS = ['hông', 'không', 'khong', 'no'];

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
    if (sheet.getLastRow() === 0) {
      writeHeader_(sheet);
    }

    var data = JSON.parse(e.postData.contents);

    // The client retries when a reply is slow or lost, and Apps Script may
    // well have written the row already. Skip anything seen before.
    var id = String(data.submissionId || '');
    if (id && alreadyStored_(sheet, id)) {
      return json({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.attending || '',
      data.slots || '',
      data.message || '',
      id,
    ]);

    styleRow_(sheet, sheet.getLastRow());
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function alreadyStored_(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  var column = HEADERS.indexOf('Id') + 1;
  var seen = sheet.getRange(2, column, lastRow - 1, 1).getValues();
  for (var i = 0; i < seen.length; i++) {
    if (String(seen[i][0]) === id) return true;
  }
  return false;
}

/** Opening the /exec URL in a browser hits this, confirming the deployment. */
function doGet() {
  return json({ ok: true, message: 'RSVP endpoint is live' });
}

/**
 * Re-applies the header and row styling to everything already in the sheet.
 * Select this in the editor's function list and press Run after changing
 * any of the constants above, or to tidy rows written by an older version.
 */
function formatAll() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    writeHeader_(sheet);
    return;
  }
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  styleHeader_(sheet);
  for (var row = 2; row <= sheet.getLastRow(); row++) {
    styleRow_(sheet, row);
  }
}

function writeHeader_(sheet) {
  sheet.appendRow(HEADERS);
  styleHeader_(sheet);
}

function styleHeader_(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground(COLOURS.header)
    .setFontColor(COLOURS.headerText)
    .setFontWeight('bold')
    .setFontSize(11)
    .setVerticalAlignment('middle');

  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 34);

  for (var i = 0; i < WIDTHS.length; i++) {
    sheet.setColumnWidth(i + 1, WIDTHS[i]);
  }

  // Hide the empty columns to the right so the sheet reads as one table
  var extra = sheet.getMaxColumns() - HEADERS.length;
  if (extra > 0) {
    sheet.hideColumns(HEADERS.length + 1, extra);
  }
}

function styleRow_(sheet, row) {
  var range = sheet.getRange(row, 1, 1, HEADERS.length);
  var attending = String(sheet.getRange(row, 3).getValue()).toLowerCase();

  var declined = DECLINE_WORDS.some(function (word) {
    return attending.indexOf(word) !== -1;
  });

  range
    .setBackground(declined ? COLOURS.notComing : COLOURS.coming)
    .setBorder(true, true, true, true, true, true, COLOURS.border,
               SpreadsheetApp.BorderStyle.SOLID)
    .setVerticalAlignment('top')
    .setFontSize(10);

  sheet.getRange(row, 1).setNumberFormat('dd/MM/yyyy  HH:mm');
  sheet.getRange(row, 2).setFontWeight('bold');

  // Long messages wrap instead of spilling over the next column
  sheet.getRange(row, 4, 1, 2).setWrap(true);
  // The id is plumbing, not something to read at a glance
  sheet.getRange(row, HEADERS.indexOf('Id') + 1).setFontSize(8).setFontColor('#b9b2a8');
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
