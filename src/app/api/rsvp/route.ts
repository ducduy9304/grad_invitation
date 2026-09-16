import { NextResponse } from "next/server";

/**
 * Takes an RSVP and forwards it to Google Apps Script, which appends a row
 * to the Sheet. Set GOOGLE_SCRIPT_URL in .env.local and in Vercel's
 * Environment Variables.
 *
 * With no URL configured the route still succeeds and just logs the payload,
 * which keeps local development working without a Sheet.
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

  // Guests may tick several time slots; flatten them into one cell
  const slots = Array.isArray(body.slots)
    ? body.slots.map((s) => String(s)).filter(Boolean).join(", ")
    : String(body.slots ?? "");

  const payload = {
    name: name.slice(0, 80),
    attending: String(body.attending ?? "").slice(0, 80),
    slots: slots.slice(0, 200),
    parking: String(body.parking ?? "").slice(0, 120),
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
      // Apps Script answers 302 towards googleusercontent; fetch follows it as GET
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`Apps Script trả về ${res.status}`);
    return NextResponse.json({ ok: true, stored: true });
  } catch (error) {
    console.error("[RSVP] ghi Sheet thất bại:", error);
    return NextResponse.json({ error: "Không ghi được" }, { status: 502 });
  }
}
