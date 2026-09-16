/**
 * Keeps replies from being lost between the guest's phone and the Sheet.
 *
 * The card appears the moment someone submits, so the write happens with
 * nobody watching. Three things can swallow it: a slow or failing Apps
 * Script, a dropped connection, and the guest closing the tab mid-request.
 * So a reply is parked here first, retried, and only dropped once the server
 * confirms it. Anything still parked is retried on the next page load.
 *
 * Retrying is safe because every reply carries a submissionId and the sheet
 * ignores one it has already stored.
 */

const KEY = "rsvp-outbox";
const RETRY_DELAYS_MS = [0, 1_500, 5_000];

export type Reply = Record<string, unknown> & { submissionId: string };

function read(): Reply[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Reply[]) : [];
  } catch {
    // Private mode, cleared storage, quota - never worth breaking the page for
    return [];
  }
}

function write(replies: Reply[]) {
  try {
    if (replies.length) localStorage.setItem(KEY, JSON.stringify(replies));
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

function park(reply: Reply) {
  const parked = read();
  if (!parked.some((r) => r.submissionId === reply.submissionId)) {
    write([...parked, reply]);
  }
}

function release(submissionId: string) {
  write(read().filter((r) => r.submissionId !== submissionId));
}

async function post(reply: Reply) {
  const res = await fetch("/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reply),
    // Lets the request outlive the page if the guest closes the tab
    keepalive: true,
  });
  if (!res.ok) throw new Error(`/api/rsvp trả về ${res.status}`);
}

/** Sends a reply, retrying a few times. Resolves true once it is stored. */
export async function send(reply: Reply): Promise<boolean> {
  park(reply);

  for (const delay of RETRY_DELAYS_MS) {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    try {
      await post(reply);
      release(reply.submissionId);
      return true;
    } catch (error) {
      console.error("[RSVP] gửi lại...", error);
    }
  }
  // Stays parked, and the next visit will try again
  return false;
}

/** Retries whatever an earlier visit could not deliver. */
export async function flush() {
  for (const reply of read()) {
    try {
      await post(reply);
      release(reply.submissionId);
    } catch {
      // Still no luck; leave it for the visit after this one
    }
  }
}
