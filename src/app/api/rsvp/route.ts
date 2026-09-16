import { NextResponse } from "next/server";

/**
 * Nhận RSVP rồi đẩy sang Google Apps Script để ghi vào Sheet.
 * Đặt GOOGLE_SCRIPT_URL trong .env.local (và trong Environment Variables của Vercel).
 * Chưa đặt thì route vẫn chạy, chỉ in ra terminal — tiện lúc code local.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Thiếu tên" }, { status: 400 });
  }

  const payload = {
    name: name.slice(0, 80),
    attending: String(body.attending ?? "").slice(0, 80),
    message: String(body.message ?? "").slice(0, 500),
    submittedAt: new Date().toISOString(),
  };

  const endpoint = process.env.GOOGLE_SCRIPT_URL;
  if (!endpoint) {
    console.log("[RSVP] chưa cấu hình GOOGLE_SCRIPT_URL:", payload);
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Apps Script luôn trả 302 sang googleusercontent, fetch tự đi theo
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`Apps Script trả về ${res.status}`);
    return NextResponse.json({ ok: true, stored: true });
  } catch (error) {
    console.error("[RSVP] ghi Sheet thất bại:", error);
    return NextResponse.json({ error: "Không ghi được" }, { status: 502 });
  }
}
