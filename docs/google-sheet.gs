/**
 * Dán toàn bộ file này vào Google Apps Script để nhận RSVP về Google Sheet.
 * Hướng dẫn từng bước xem ở README.md, mục "Nhận RSVP về Google Sheet".
 */

function doPost(e) {
  // Nhiều người bấm gửi cùng lúc thì các lệnh ghi có thể đè lên nhau.
  // Khoá lại để mỗi lần chỉ một lượt ghi, chờ tối đa 20 giây.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json({ ok: false, error: 'Máy chủ đang bận' });
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Lần chạy đầu tiên thì tạo dòng tiêu đề
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Thời điểm', 'Tên', 'Tham dự', 'Lời nhắn']);
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

/** Mở URL /exec bằng trình duyệt sẽ thấy dòng này — dùng để kiểm tra đã deploy đúng chưa. */
function doGet() {
  return json({ ok: true, message: 'Endpoint RSVP đang chạy' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
