import { after } from "next/server";

/**
 * Receives the beacons from VisitLog and appends a line to a Google Sheet of
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

/*
 * Samsung, Xiaomi, Oppo and Vivo report a part number rather than the name on
 * the box. Only codes worth recognising are listed; anything unknown passes
 * through as-is, which is still searchable. Extend it freely.
 */
const MODELS: Record<string, string> = {
  "SM-S938": "Galaxy S25 Ultra",
  "SM-S931": "Galaxy S25",
  "SM-S928": "Galaxy S24 Ultra",
  "SM-S926": "Galaxy S24+",
  "SM-S921": "Galaxy S24",
  "SM-S918": "Galaxy S23 Ultra",
  "SM-S916": "Galaxy S23+",
  "SM-S911": "Galaxy S23",
  "SM-A566": "Galaxy A56",
  "SM-A556": "Galaxy A55",
  "SM-A546": "Galaxy A54",
  "SM-A536": "Galaxy A53",
  "SM-A366": "Galaxy A36",
  "SM-A356": "Galaxy A35",
  "SM-A346": "Galaxy A34",
  "SM-A166": "Galaxy A16",
  "SM-A155": "Galaxy A15",
  "SM-A057": "Galaxy A05s",
};

/** "SM-A546E" is sold as a Galaxy A54; the trailing letter is the region. */
function nameModel(raw: string) {
  const code = raw.trim();
  if (!code) return "";
  const known = MODELS[code.slice(0, 7).toUpperCase()];
  return known ? `${known} (${code})` : code;
}

/** What the request itself reveals, which is a browser, never a person. */
function readAgent(ua: string) {
  const app = /FBAN|FBAV|FB_IAB/i.test(ua)
    ? "Facebook"
    : /Instagram/i.test(ua)
      ? "Instagram"
      : /Zalo/i.test(ua)
        ? "Zalo"
        : "";

  const apple = /iPhone|iPad|iPod/i.test(ua);
  const os = apple
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

  /*
   * Apple publishes no model anywhere, so an iPhone can only ever be an
   * iPhone. The iOS version is the one extra thing the agent string admits to.
   */
  const version = apple
    ? (/OS (\d+)[._](\d+)/.exec(ua)?.slice(1, 3).join(".") ?? "")
    : "";

  return { os, browser, kind, apple, version };
}

/**
 * Renderers, crawlers and link-preview fetchers open the page too, and a
 * thumbnail bot sitting in a datacentre would otherwise read as a guest.
 */
function isRobot(ua: string) {
  return !ua || /bot|crawler|spider|preview|headless|vercel|lighthouse/i.test(ua);
}

/** "https://m.facebook.com/..." reads better in a sheet as "m.facebook.com". */
function host(raw: string) {
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function forward(endpoint: string, payload: unknown) {
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
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // A malformed beacon is still a visit; log what the headers give us
  }

  const ua = request.headers.get("user-agent") ?? "";
  if (isRobot(ua)) {
    return new Response(null, { status: 204 });
  }

  const endpoint = process.env.VISIT_LOG_URL;
  const device = String(body.id ?? "").slice(0, 32);

  /*
   * The second beacon, sent as they leave. It fills in the seconds on the row
   * the first one wrote rather than adding a row of its own.
   */
  if (body.close) {
    const closing = {
      close: true,
      device,
      // An hour is longer than anyone reads an invitation; beyond that the
      // tab was left open and the number says nothing.
      seconds: Math.min(Math.max(Number(body.s) || 0, 0), 3600),
    };
    if (!endpoint) {
      console.log("[visit] chưa cấu hình VISIT_LOG_URL:", closing);
    } else {
      forward(endpoint, closing);
    }
    return new Response(null, { status: 204 });
  }

  const { os, browser, kind, apple, version } = readAgent(ua);
  const platform = String(body.pv ?? "").split(".")[0];

  /*
   * Vercel resolves the place for us, so the address itself is never stored.
   * A town is enough to picture who opened the link; an IP identifies a
   * household, and nothing here is worth holding that. Mobile networks often
   * resolve to nothing, in which case the region code is the last clue left.
   */
  const city = decodeURIComponent(
    request.headers.get("x-vercel-ip-city") ?? "",
  ).replace(/\+/g, " ");
  const region = request.headers.get("x-vercel-ip-country-region") ?? "";
  const country = request.headers.get("x-vercel-ip-country") ?? "";

  const payload = {
    at: new Date().toISOString(),
    device,
    visit: Number(body.n) || 1,
    from: host(String(body.from ?? "")) || "Trực tiếp",
    kind,
    model: apple ? "iPhone" : nameModel(String(body.model ?? "")),
    os: [os, apple ? version : platform].filter(Boolean).join(" "),
    browser,
    place: [city || region, country].filter(Boolean).join(", "),
    invite: String(body.k ?? "").slice(0, 60),
  };

  if (!endpoint) {
    console.log("[visit] chưa cấu hình VISIT_LOG_URL:", payload);
    return new Response(null, { status: 204 });
  }

  forward(endpoint, payload);
  return new Response(null, { status: 204 });
}
