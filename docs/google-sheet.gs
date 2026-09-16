/**
 * Dán toàn bộ file này vào Google Apps Script để nhận RSVP về Google Sheet.
 *
 * Các bước:
 *  1. Tạo một Google Sheet mới.
 *  2. Menu Tiện ích mở rộng > Apps Script, xoá code mẫu, dán file này vào.
 *  3. Triển khai > Lần triển khai mới > loại "Ứng dụng web".
 *       - Thực thi với tư cách: Tôi
 *       - Ai có quyền truy cập: Bất kỳ ai
 *  4. Copy URL /exec nhận được, bỏ vào GOOGLE_SCRIPT_URL trong .env.local
 *     và trong Environment Variables trên Vercel.
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

  // Lần chạy đầu tiên thì tạo dòng tiêu đề
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Thời điểm', 'Tên', 'Tham dự', 'Lời nhắn']);
  }

  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.name || '',
    data.attending || '',
    data.message || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
