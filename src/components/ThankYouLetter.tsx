"use client";

import { motion } from "motion/react";
import { content } from "@/data/content";

/*
 * What a guest gets when they answer that they cannot come.
 *
 * The invitation card is deliberately not shown here: it is a picture of a
 * date, a floor and a set of time windows, none of which are any use to
 * someone who will not be there. A letter is, so this is a letter.
 *
 * Plain DOM rather than the canvas the invitation uses, because nothing about
 * it needs saving to a photo album.
 */

export function ThankYouLetter({
  guestName,
  wish,
}: {
  guestName: string;
  /** The guest's own words, shown back to them so they know it arrived. */
  wish: string;
}) {
  const letter = content.thanksLetter;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-8 w-full max-w-md bg-white px-7 pt-10 pb-9 text-left shadow-[0_12px_34px_rgba(44,39,36,0.18)]"
    >
      <span className="tape -top-3 left-10 -rotate-6" />
      <span className="tape -top-3 right-10 rotate-6" />

      <p className="font-display text-2xl text-ink">
        {letter.salutation}{" "}
        <span className="text-foil font-semibold">{guestName}</span>,
      </p>

      <div className="mt-5 space-y-4 text-base leading-relaxed text-ink">
        {letter.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {wish && (
        <figure className="mt-7 border-l-2 border-gold/45 pl-4">
          <figcaption className="text-xs tracking-[0.18em] text-gold uppercase">
            {letter.wishHeading}
          </figcaption>
          <blockquote className="mt-2 text-base leading-relaxed text-ink/80 italic">
            {wish}
          </blockquote>
        </figure>
      )}

      <p className="mt-8 text-base text-ink-soft">{letter.signOff}</p>
      <p className="font-display text-foil mt-1 text-3xl">{letter.signature}</p>
    </motion.article>
  );
}
