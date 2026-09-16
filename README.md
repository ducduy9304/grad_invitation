# Thiệp mời tốt nghiệp

Web thiệp mời một trang. Phong cách giấy kem – băng keo washi – chữ nhũ, dựng bằng
Next.js 16 + Tailwind v4 + Motion, deploy thẳng lên Vercel.

## Chạy local

```bash
npm run dev
```

Mở http://localhost:3000

## Sửa nội dung

Toàn bộ chữ nghĩa, ngày giờ, địa điểm nằm trong **một file duy nhất**:
[`src/data/content.ts`](src/data/content.ts). Không cần đụng vào component nào.

Vài chỗ hay sửa nhất:

| Trường          | Ý nghĩa                                                 |
| ----------------- | --------------------------------------------------------- |
| `graduateName`  | Tên hiện ở hero và trên dấu sáp phong bì          |
| `eventStart`    | Mốc đếm ngược, định dạng ISO kèm`+07:00`       |
| `venue.mapsUrl` | Link Google Maps của nút "Chỉ đường"                |
| `parking`       | Danh sách chỗ gửi xe và link bản đồ              |
| `gallery`       | Album ảnh, để mảng rỗng thì phần này tự ẩn      |
| `music`         | Đường dẫn file nhạc,`null` thì nút nhạc tự ẩn |

## Thay ảnh

Bỏ ảnh vào `public/images/` rồi trỏ đường dẫn trong `content.ts`.

| File | Dùng ở đâu | Tỉ lệ |
|---|---|---|
| `hero-edited.jpg` | Khung ảnh ở hero | bất kỳ — khung tự bám theo |
| `og.jpg` | Ảnh xem trước khi gửi link qua Zalo/Messenger | ngang 1.91:1 |

Khung ảnh hero **tự bám theo tỉ lệ thật của file**, không cắt xén gì. Đổi ảnh khác
tỉ lệ thì sửa `width` và `height` trong `heroPhoto` cho khớp kích thước file mới.

Ảnh gốc để ở `docs/`. **Đặt tên file mới mỗi lần thay ảnh**, đừng ghi đè cùng tên —
Next lưu bản đã tối ưu theo đường dẫn nên ghi đè sẽ vẫn ra ảnh cũ.

## Nhạc nền

Bỏ file mp3 vào `public/audio/`, rồi đổi `music` trong `content.ts` thành
`"/audio/ten-file.mp3"`. Nút nhạc mặc định TẮT, khách tự bấm mới chạy.

## Nhận RSVP về Google Sheet

1. Tạo một Google Sheet mới tại [sheets.new](https://sheets.new), đặt tên tuỳ ý.
2. Menu **Tiện ích mở rộng → Apps Script**. Xoá hết code mẫu, dán toàn bộ
   [`docs/google-sheet.gs`](docs/google-sheet.gs) vào, bấm lưu.
3. Bấm **Triển khai → Lần triển khai mới**. Bấm icon bánh răng cạnh "Chọn loại"
   rồi chọn **Ứng dụng web**. Đặt:
   - Thực thi với tư cách: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
4. Lần đầu Google sẽ hỏi cấp quyền. Màn hình "Google chưa xác minh ứng dụng này"
   là bình thường — bấm **Nâng cao → Chuyển đến … (không an toàn)**. Đây là script
   của chính bạn, chạy trên tài khoản của bạn.
5. Copy **URL ứng dụng web** (kết thúc bằng `/exec`).
6. Mở URL đó bằng trình duyệt để kiểm tra. Thấy `{"ok":true,...}` là đã chạy.

Rồi khai báo cho web biết:

```bash
cp .env.local.example .env.local
# dán URL /exec vào GOOGLE_SCRIPT_URL
```

Trên Vercel thì vào **Settings → Environment Variables** thêm cùng biến đó,
rồi **Redeploy** (biến môi trường chỉ áp dụng cho lần build mới).

Chưa cấu hình cũng không sao — form vẫn chạy, nội dung in ra terminal.

> **Sửa script sau này**: mỗi lần sửa code phải **Triển khai → Quản lý các lần
> triển khai → sửa → Phiên bản: Phiên bản mới**. Chỉ bấm lưu thôi thì URL `/exec`
> vẫn chạy code cũ.


## Deploy lên Vercel

1. Đẩy repo lên GitHub.
2. Vào vercel.com > Add New > Project > chọn repo. Vercel tự nhận Next.js.
3. Trong Settings > Environment Variables, thêm `GOOGLE_SCRIPT_URL`
   và `NEXT_PUBLIC_SITE_URL` (domain Vercel cấp).
4. Deploy.
