/**
 * Paste this into a Google Apps Script attached to a BRAND NEW spreadsheet,
 * not the one collecting RSVPs. The two are kept apart on purpose: the RSVP
 * sheet is live and already deployed, and nothing here is worth risking it.
 *
 * Step-by-step setup is in README.md, "See who opened the invitation".
 */

var HEADERS = [
  'Timestamp',   // when the page was opened
  'Device',      // random name for a browser, not for a person
  'Visit',       // 1 the first time, 2 the next, and so on
  'Source',      // the app or site the link was followed from
  'Type',        // phone or computer
  'OS',
  'Browser',
  'Place',       // town and country, resolved by Vercel; no address is stored
  'Invite',      // filled only when the link was sent to one named person
];

/** Pixel widths per column, in the same order as HEADERS. */
var WIDTHS = [150, 110, 60, 170, 100, 90, 110, 190, 130];

var COLOURS = {
  header: '#b8944f',      // gold, same as the invitation
  headerText: '#ffffff',
  first: '#ffffff',       // a browser seen for the first time
  repeat: '#f5f0e4',      // someone who came back, which is worth noticing
  border: '#e2d9c9',
  quiet: '#b9b2a8',
};

function doPost(e) {
  // Several people can open the link in the same second and their appends
  // would race. Serialise them; give up rather than hanging.
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

    sheet.appendRow([
      new Date(),
      safe_(data.device),
      Number(data.visit) || 1,
      safe_(data.from),
      safe_(data.kind),
      safe_(data.os),
      safe_(data.browser),
      safe_(data.place),
      safe_(data.invite),
    ]);

    styleRow_(sheet, sheet.getLastRow());
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * A cell beginning with = + - or @ is read by Sheets as a formula, and the
 * text here comes from the open internet. A leading apostrophe keeps it text.
 */
function safe_(value) {
  var text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

/** Opening the /exec URL in a browser hits this, confirming the deployment. */
function doGet() {
  return json({ ok: true, message: 'Visit log endpoint is live' });
}

/**
 * Counts each browser once, so you can read the total at a glance instead of
 * scrolling. Select it in the editor's function list and press Run; it writes
 * the answer into a second sheet and never touches the rows above.
 */
function summarise() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheets()[0];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var deviceCol = HEADERS.indexOf('Device') + 1;
  var sourceCol = HEADERS.indexOf('Source') + 1;
  var rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();

  var opens = {};
  var lastSeen = {};
  var source = {};
  for (var i = 0; i < rows.length; i++) {
    var id = String(rows[i][deviceCol - 1]);
    if (!id) continue;
    opens[id] = (opens[id] || 0) + 1;
    lastSeen[id] = rows[i][0];
    source[id] = rows[i][sourceCol - 1];
  }

  var out = book.getSheetByName('Devices') || book.insertSheet('Devices');
  out.clear();
  out.appendRow(['Device', 'Opens', 'Last seen', 'Source']);
  var ids = Object.keys(opens);
  for (var j = 0; j < ids.length; j++) {
    out.appendRow([ids[j], opens[ids[j]], lastSeen[ids[j]], source[ids[j]]]);
  }

  out.getRange(1, 1, 1, 4)
    .setBackground(COLOURS.header)
    .setFontColor(COLOURS.headerText)
    .setFontWeight('bold');
  out.setFrozenRows(1);
  out.getRange(2, 3, Math.max(ids.length, 1), 1)
    .setNumberFormat('dd/MM/yyyy  HH:mm');
  // Most opens first: the people who keep coming back are the interesting ones
  if (ids.length > 1) {
    out.getRange(2, 1, ids.length, 4).sort({ column: 2, ascending: false });
  }
}

/**
 * Re-applies the header and row styling to everything already in the sheet.
 * Run it after changing any of the constants above.
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

  var extra = sheet.getMaxColumns() - HEADERS.length;
  if (extra > 0) {
    sheet.hideColumns(HEADERS.length + 1, extra);
  }
}

function styleRow_(sheet, row) {
  var visitCol = HEADERS.indexOf('Visit') + 1;
  var repeat = Number(sheet.getRange(row, visitCol).getValue()) > 1;

  sheet.getRange(row, 1, 1, HEADERS.length)
    .setBackground(repeat ? COLOURS.repeat : COLOURS.first)
    .setBorder(true, true, true, true, true, true, COLOURS.border,
               SpreadsheetApp.BorderStyle.SOLID)
    .setVerticalAlignment('middle')
    .setFontSize(10);

  sheet.getRange(row, 1).setNumberFormat('dd/MM/yyyy  HH:mm');
  sheet.getRange(row, visitCol).setHorizontalAlignment('center');
  if (repeat) {
    sheet.getRange(row, visitCol).setFontWeight('bold');
  }
  // The browser's name is plumbing, not something to read at a glance
  sheet.getRange(row, HEADERS.indexOf('Device') + 1)
    .setFontSize(8)
    .setFontColor(COLOURS.quiet);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
