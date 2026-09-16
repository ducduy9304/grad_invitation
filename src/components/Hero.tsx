"use client";

import { motion } from "motion/react";
import { content } from "@/data/content";
import { Polaroid } from "./Polaroid";
import { Countdown } from "./Countdown";

const ease = [0.22, 1, 0.36, 1] as const;

/*
 * The whole hero must fit in a single viewport, including short laptop screens.
 * So every vertical gap is a clamp() anchored to svh: tall screens breathe,
 * short screens compress. svh rather than vh, because on phones vh ignores the
 * browser's address bar and the bottom of the hero would be cut off.
 */
const gapSm = "mt-[clamp(0.55rem,1.6svh,1.1rem)]";
const gapMd = "mt-[clamp(0.65rem,1.6svh,1.6rem)]";

export function Hero() {
  return (
    <header className="relative mx-auto flex min-h-svh max-w-4xl flex-col items-center justify-center px-6 py-[clamp(1rem,2svh,2rem)] text-center">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.05, ease }}
        className="font-display text-xs leading-relaxed tracking-[0.26em] whitespace-pre-line text-ink uppercase sm:text-sm"
      >
        {content.overline}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.16, ease }}
        className={`text-foil ${gapSm} font-display text-[clamp(1.6rem,5.6vw,2.5rem)] leading-[1.15] tracking-wide whitespace-pre-line uppercase`}
      >
        {content.title}
      </motion.h1>

      {/* Photo sits straight; the frame follows the file's real aspect ratio */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease }}
        className={`${gapMd} w-full`}
      >
        <Polaroid
          src={content.heroPhoto.src}
          alt={content.heroPhoto.alt}
          caption={content.heroPhoto.caption}
          width={content.heroPhoto.width}
          height={content.heroPhoto.height}
          /*
           * As large as possible while keeping the whole hero in one viewport.
           * Measured on the real page: everything except the photo (including
           * the 20px white frame around it) costs roughly 18%svh + 370px on
           * phones and 22%svh + 410px on desktop.
           */
          fitHeight="max-h-[clamp(6rem,calc(82svh-322px),34rem)] sm:max-h-[clamp(6rem,calc(78svh-362px),40rem)]"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 80vw, 55vw"
          tape="corner"
          rotate={0}
          priority
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.62 }}
        className={gapMd}
      >
        <p className="font-display text-xs tracking-[0.26em] text-ink uppercase sm:text-sm">
          {content.inviteLine}
        </p>
        <p className="text-foil mt-1 font-display text-[clamp(1.5rem,4.4vw,2.25rem)] tracking-wide">
          {content.inviteName}
        </p>
      </motion.div>

      {/* Date strip, rebuilding the three-column rhythm of the paper card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.72, ease }}
        className={`relative ${gapMd} w-full max-w-md bg-white px-6 py-[clamp(0.6rem,1.8svh,1.25rem)] shadow-[0_8px_24px_rgba(44,39,36,0.12)]`}
      >
        <span className="tape -top-3 -left-6 -rotate-12" />
        <span className="tape -right-6 -bottom-3 -rotate-12" />
        <div className="grid grid-cols-3 items-center gap-2">
          <span className="font-display text-sm tracking-wide whitespace-nowrap text-ink uppercase sm:text-lg sm:tracking-widest">
            {content.date.weekday}
          </span>
          <span className="flex flex-col items-center leading-none">
            <span className="font-display text-sm tracking-widest text-ink">
              {content.date.month}
            </span>
            <span className="font-display text-[clamp(2rem,5vw,3rem)] text-ink">
              {content.date.day}
            </span>
          </span>
          <span className="font-display text-sm tracking-wide whitespace-nowrap text-ink sm:text-lg sm:tracking-widest">
            {content.time.range}
          </span>
        </div>
      </motion.div>

      {/* Countdown lives in the first viewport, no scrolling required */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.82, ease }}
        className={`${gapMd} flex w-full max-w-sm flex-col items-center`}
      >
        <p className="mb-2 font-display text-xs tracking-[0.24em] text-ink uppercase sm:text-sm">
          Còn lại
        </p>
        <Countdown />
      </motion.div>

    </header>
  );
}
