"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { content } from "@/data/content";
import { flush, send } from "@/lib/rsvp-outbox";
import { GuestCard } from "./GuestCard";
import { Reveal } from "./Reveal";
import { ThankYouLetter } from "./ThankYouLetter";

type Status = "idle" | "sent";

const field =
  "w-full border-b border-ink/20 bg-transparent px-1 py-2.5 text-base text-ink outline-none transition focus:border-gold placeholder:text-ink/35";

export function Rsvp() {
  const [status, setStatus] = useState<Status>("idle");
  // Kept so the card can be addressed to whoever just replied
  const [guestName, setGuestName] = useState("");
  const [guestSlots, setGuestSlots] = useState<string[]>([]);
  const [guestWish, setGuestWish] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);
  /*
   * Controlled, because the rest of the form follows it: someone who cannot
   * come is asked for a wish instead of a time window, and ends on a letter
   * rather than an invitation they have no use for.
   */
  const [attending, setAttending] = useState(content.rsvp.attendingOptions[0]);
  const declined = attending === content.rsvp.declineOption;

  // A reply a previous visit could not deliver gets another go
  useEffect(() => {
    void flush();
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sent") return;

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    // Identifies this reply so a retry cannot store it twice
    const submissionId = crypto.randomUUID();
    const message = String(form.get("message") ?? "").trim();
    const data = {
      name,
      attending,
      // Repeated field: getAll, because entries() would keep only the last tick
      slots: form.getAll("slots"),
      message,
    };

    /*
     * Show the card straight away instead of waiting on the round trip.
     * Google Apps Script answers anywhere between 3 and 30 seconds, and the
     * card is drawn entirely from what the guest just typed, so there is
     * nothing in it worth waiting for. The write continues underneath; if it
     * fails the success screen says so rather than pretending it landed.
     */
    setGuestName(name);
    setGuestSlots(data.slots.map(String));
    setGuestWish(message);
    setStatus("sent");

    void send({ ...data, submissionId }).then((stored) => {
      if (!stored) setSaveFailed(true);
    });
  }

  if (status === "sent") {
    return (
      <section className="px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-4xl" aria-hidden>
            💌
          </p>
          <h2 className="text-foil mt-4 text-3xl font-semibold">
            {declined ? content.rsvp.doneTitleAway : content.rsvp.doneTitle}
          </h2>
          {!declined && (
            <p className="mt-3 text-base text-ink">
              {content.rsvp.doneNote} {content.date.full}.
            </p>
          )}
          {saveFailed && (
            <p className="mx-auto mt-5 max-w-md rounded-sm border border-red-700/30 bg-red-50 px-4 py-3 text-sm text-red-800">
              {content.rsvp.errorText}
            </p>
          )}
          {declined ? (
            <ThankYouLetter guestName={guestName} wish={guestWish} />
          ) : (
            <GuestCard guestName={guestName} slots={guestSlots} />
          )}
        </motion.div>
      </section>
    );
  }

  return (
    <section className="px-6 py-16">
      <Reveal>
        <h2 className="text-center text-2xl font-semibold tracking-wide text-ink sm:text-3xl">
          {content.rsvp.heading}
        </h2>
      </Reveal>

      <Reveal delay={0.1}>
        <form
          onSubmit={handleSubmit}
          className="relative mx-auto mt-10 max-w-md bg-white px-7 py-9 shadow-[0_10px_30px_rgba(44,39,36,0.12)]"
        >
          <span className="tape -top-3 left-8 -rotate-6" />
          <span className="tape -top-3 right-8 rotate-6" />

          <label className="block">
            <span className="text-sm tracking-[0.18em] text-ink uppercase">
              {content.rsvp.nameLabel}
            </span>
            <input
              name="name"
              required
              maxLength={80}
              autoComplete="name"
              placeholder={content.rsvp.namePlaceholder}
              className={`${field} mt-2`}
            />
          </label>

          <fieldset className="mt-7">
            <legend className="text-sm tracking-[0.18em] text-ink uppercase">
              {content.rsvp.attendingLabel}
            </legend>
            <div className="mt-3 space-y-2">
              {content.rsvp.attendingOptions.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 text-base text-ink"
                >
                  <input
                    type="radio"
                    name="attending"
                    value={option}
                    checked={attending === option}
                    onChange={() => setAttending(option)}
                    className="h-4.5 w-4.5 accent-[#b8944f]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Unmounted rather than hidden, so ticks made before switching
              to "cannot come" are not submitted along with the reply */}
          {!declined && (
            <fieldset className="mt-7">
              <legend className="text-sm tracking-[0.18em] text-ink uppercase">
                {content.rsvp.slotLabel}
              </legend>
              <div className="mt-3 space-y-2">
                {content.rsvp.slotOptions.map((slot) => (
                  <label
                    key={slot}
                    className="flex cursor-pointer items-center gap-3 text-base text-ink"
                  >
                    <input
                      type="checkbox"
                      name="slots"
                      value={slot}
                      className="h-4.5 w-4.5 accent-[#b8944f]"
                    />
                    {slot}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <label className="mt-7 block">
            <span className="text-sm tracking-[0.18em] text-ink uppercase">
              {declined ? content.rsvp.wishLabel : content.rsvp.messageLabel}
            </span>
            <textarea
              name="message"
              rows={1}
              maxLength={500}
              placeholder={
                declined
                  ? content.rsvp.wishPlaceholder
                  : content.rsvp.messagePlaceholder
              }
              // Starts one line tall and grows with the text. overflow-hidden
              // keeps scrollHeight honest, otherwise it stops at the box size.
              onInput={(event) => {
                const el = event.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
              className={`${field} mt-2 resize-none overflow-hidden`}
            />
          </label>

          <button
            type="submit"
            className="mt-8 w-full rounded-full bg-gradient-to-r from-gold to-gold-light py-3.5 text-base font-medium tracking-[0.05em] text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {content.rsvp.submit}
          </button>
        </form>
      </Reveal>
    </section>
  );
}
