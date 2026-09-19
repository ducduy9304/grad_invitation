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

/** One report per page load, not one per effect run (dev mounts twice). */
let reported = false;

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

export function VisitLog() {
  useEffect(() => {
    if (reported) return;
    reported = true;

    const { id, n } = mark();
    const body = JSON.stringify({
      id,
      n,
      from: document.referrer,
      /*
       * Set when the link was sent to one person rather than posted, which is
       * the only way a public page can ever put a name to a visit.
       */
      k: new URLSearchParams(window.location.search).get("k") ?? "",
    });

    try {
      // A beacon still arrives when the tab is closed a second later; plain
      // fetch would be cancelled with it.
      const blob = new Blob([body], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/visit", blob)) {
        void fetch("/api/visit", { method: "POST", body, keepalive: true });
      }
    } catch {
      // A visit that cannot be recorded is not worth breaking a page over
    }
  }, []);

  return null;
}
