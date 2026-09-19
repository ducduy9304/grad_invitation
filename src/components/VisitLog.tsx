"use client";

import { useEffect } from "react";

/*
 * Records that someone opened the page, so the invitation can be told how far
 * it travelled.
 *
 * It renders nothing and touches nothing a guest can see: no banner, no
 * consent prompt, no cookie. One small key in local storage gives a browser a
 * random name and counts how many times it has come back -- the counting
 * happens here rather than on the server so the log can say "third visit"
 * without ever needing to know who the visitor is.
 *
 * The name is random and belongs to a browser, not a person: the same phone in
 * Chrome and in Safari is two names, and clearing site data starts a new one.
 * That is the honest ceiling for a link posted in public.
 */

const KEY = "tg-v";
const ENDPOINT = "/api/visit";

/*
 * Module state, not component state: development mounts every component twice
 * and a doubled visit would be a lie in the sheet. Held out here, the opening
 * is reported once and the leaving once, however often the effect runs.
 */
let opened: { id: string; at: number } | null = null;
let left = false;

type Mark = { id: string; n: number };

function newId() {
  try {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  } catch {
    return Math.random().toString(36).slice(2, 12);
  }
}

function mark(): Mark {
  const first = { id: newId(), n: 1 };
  try {
    const raw = window.localStorage.getItem(KEY);
    const seen = raw ? (JSON.parse(raw) as Partial<Mark>) : null;
    const next =
      seen && typeof seen.id === "string"
        ? { id: seen.id, n: (Number(seen.n) || 0) + 1 }
        : first;
    window.localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    // Private windows and blocked storage: still count the visit, just
    // without being able to tie it to the same browser's earlier ones.
    return first;
  }
}

/** A beacon still arrives when the tab is closed a second later. */
function send(payload: unknown) {
  const body = JSON.stringify(payload);
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.(ENDPOINT, blob)) {
      void fetch(ENDPOINT, { method: "POST", body, keepalive: true });
    }
  } catch {
    // A visit that cannot be recorded is not worth breaking a page over
  }
}

/**
 * The model of the phone, which only Chromium answers and only when asked
 * directly: it is kept out of the user agent string on purpose. Safari has no
 * such API at all, so an iPhone stays an iPhone and nothing more.
 */
async function askModel() {
  type UAD = {
    getHighEntropyValues: (
      hints: string[],
    ) => Promise<{ model?: string; platformVersion?: string }>;
  };
  const uad = (navigator as Navigator & { userAgentData?: UAD }).userAgentData;
  if (!uad?.getHighEntropyValues) return {};
  try {
    const got = await uad.getHighEntropyValues(["model", "platformVersion"]);
    return { model: got.model ?? "", pv: got.platformVersion ?? "" };
  } catch {
    return {};
  }
}

export function VisitLog() {
  useEffect(() => {
    if (!opened) {
      const { id, n } = mark();
      opened = { id, at: Date.now() };

      void askModel().then((hardware) =>
        send({
          id,
          n,
          from: document.referrer,
          /*
           * Set when the link was sent to one person rather than posted, which
           * is the only way a public page can ever put a name to a visit.
           */
          k: new URLSearchParams(window.location.search).get("k") ?? "",
          ...hardware,
        }),
      );
    }
    const { id, at } = opened;

    /*
     * How long they stayed, sent when they leave. "hidden" rather than
     * "unload", because a phone switching apps or locking never fires unload
     * and the reading would be lost on exactly the visitors we care about.
     *
     * It reports the moment they first looked away, which is the honest
     * reading of how long the invitation held them.
     */
    const leave = () => {
      if (left) return;
      left = true;
      const seconds = Math.round((Date.now() - at) / 1000);
      if (seconds > 0) send({ id, s: seconds, close: true });
    };
    // Switching apps or locking the phone; closing the tab outright
    const onHide = () => {
      if (document.visibilityState === "hidden") leave();
    };

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", leave);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", leave);
    };
  }, []);

  return null;
}
