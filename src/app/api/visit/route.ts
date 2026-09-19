import { after } from "next/server";

/**
 * Receives the beacon from VisitLog and appends a line to a Google Sheet of
 * its own -- not the RSVP sheet, which is live and must not be touched.
 * Set VISIT_LOG_URL in .env.local and in Vercel's Environment Variables.
 *
 * Deliberately not NEXT_PUBLIC_: the address of the log never reaches the
 * browser, so the page gives away nothing about where it goes.
 *
 * With no URL configured the route still succeeds, which keeps local
 * development working without a sheet.
 */

export const maxDuration = 30;

/** What the request itself reveals, which is a browser, never a person. */
function readAgent(ua: string) {
  const app = /FBAN|FBAV|FB_IAB/i.test(ua)
    ? "Facebook"
    : /Instagram/i.test(ua)
      ? "Instagram"
      : /Zalo/i.test(ua)
        ? "Zalo"
        : "";

  const os = /iPhone|iPad|iPod/i.test(ua)
    ? "iOS"
    : /Android/i.test(ua)
      ? "Android"
      : /Windows/i.test(ua)
        ? "Windows"
        : /Mac OS X/i.test(ua)
          ? "macOS"
          : /Linux/i.test(ua)
            ? "Linux"
            : "";

  // An in-app webview is worth more than the engine it happens to use:
  // "opened it inside Facebook" says where the link was found.
  const browser =
    app ||
    (/Edg\//i.test(ua)
      ? "Edge"
      : /OPR\/|Opera/i.test(ua)
        ? "Opera"
        : /Chrome\//i.test(ua)
          ? "Chrome"
          : /Firefox\//i.test(ua)
            ? "Firefox"
            : /Safari\//i.test(ua)
              ? "Safari"
              : "");

  const kind = /Mobile|iPhone|Android/i.test(ua) ? "Điện thoại" : "Máy tính";

  return { os, browser, kind };
}

/** "https://m.facebook.com/..." reads better in a sheet as "m.facebook.com". */
function host(raw: string) {
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // A malformed beacon is still a visit; log what the headers give us
  }

  const ua = request.headers.get("user-agent") ?? "";
  const { os, browser, kind } = readAgent(ua);

  /*
   * Vercel resolves the city for us, so the address itself is never stored.
   * A town is enough to picture who opened the link; an IP identifies a
   * household, and nothing here is worth holding that.
   */
  const city = decodeURIComponent(
    request.headers.get("x-vercel-ip-city") ?? "",
  ).replace(/\+/g, " ");
  const country = request.headers.get("x-vercel-ip-country") ?? "";

  const payload = {
    at: new Date().toISOString(),
    device: String(body.id ?? "").slice(0, 32),
    visit: Number(body.n) || 1,
    from: host(String(body.from ?? "")) || "Trực tiếp",
    kind,
    os,
    browser,
    place: [city, country].filter(Boolean).join(", "),
    invite: String(body.k ?? "").slice(0, 60),
  };

  const endpoint = process.env.VISIT_LOG_URL;
  if (!endpoint) {
    console.log("[visit] chưa cấu hình VISIT_LOG_URL:", payload);
    return new Response(null, { status: 204 });
  }

  /*
   * Answer first, write afterwards. Apps Script has been measured taking up to
   * half a minute, and nothing about the page should wait on a log line.
   */
  after(async () => {
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        // Apps Script answers 302 towards googleusercontent; follow it
        redirect: "follow",
        signal: AbortSignal.timeout(25_000),
      });
    } catch (error) {
      console.error("[visit] ghi log thất bại:", error);
    }
  });

  return new Response(null, { status: 204 });
}
