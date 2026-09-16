"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { content } from "@/data/content";
import { Reveal } from "./Reveal";

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "w-full border-b border-ink/20 bg-transparent px-1 py-2.5 text-base text-ink outline-none transition focus:border-gold placeholder:text-ink/35";

export function Rsvp() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    const form = new FormData(event.currentTarget);
    const data = {
      name: form.get("name"),
      attending: form.get("attending"),
      // Repeated field: getAll, because entries() would keep only the last tick
      slots: form.getAll("slots"),
      message: form.get("message"),
    };

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
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
          <h2 className="text-foil mt-4 text-3xl font-semibold">{content.rsvp.doneTitle}</h2>
          <p className="mt-3 text-base text-ink">
            {content.rsvp.doneNote} {content.date.full}.
          </p>
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
              {content.rsvp.attendingOptions.map((option, i) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 text-base text-ink"
                >
                  <input
                    type="radio"
                    name="attending"
                    value={option}
                    required
                    defaultChecked={i === 0}
                    className="h-4.5 w-4.5 accent-[#b8944f]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

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

          <label className="mt-7 block">
            <span className="text-sm tracking-[0.18em] text-ink uppercase">
              {content.rsvp.messageLabel}
            </span>
            <textarea
              name="message"
              rows={1}
              maxLength={500}
              placeholder={content.rsvp.messagePlaceholder}
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

          {status === "error" && (
            <p className="mt-5 text-base text-red-700">{content.rsvp.errorText}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-8 w-full rounded-full bg-gradient-to-r from-gold to-gold-light py-3.5 text-base font-medium tracking-[0.05em] text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {status === "sending" ? content.rsvp.submitting : content.rsvp.submit}
          </button>
        </form>
      </Reveal>
    </section>
  );
}
