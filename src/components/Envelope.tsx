"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { content } from "@/data/content";

/**
 * The opening curtain: a wax-sealed envelope.
 * Tapping it lifts the flap, slides the card out, then fades the curtain away.
 */
/** Wax-seal letter: first letter of the given name, e.g. "Mai Anh" -> "A". */
const initial = (content.graduateName.trim().split(/\s+/).pop() ?? "")
  .charAt(0)
  .toUpperCase();

export function Envelope({ onOpen }: { onOpen: () => void }) {
  const [gone, setGone] = useState(false);
  const [opening, setOpening] = useState(false);

  function handleOpen() {
    if (opening) return;
    setOpening(true);
    // Let the animation finish before handing scrolling back to the page
    window.setTimeout(() => {
      setGone(true);
      onOpen();
    }, 1500);
  }

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-paper px-4 sm:gap-12"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* The whole envelope is the button, not just the hint below it */}
          <motion.div
            className={`relative ${opening ? "" : "cursor-pointer"}`}
            style={{ perspective: 1200 }}
            role="button"
            tabIndex={opening ? -1 : 0}
            aria-label="Khui thiệp"
            onClick={handleOpen}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpen();
              }
            }}
            whileHover={opening ? undefined : { y: -6 }}
            whileTap={opening ? undefined : { scale: 0.985 }}
            animate={opening ? { y: -40, scale: 1.04 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/*
              The card tucked inside, sliding up on open.
              Its z-index sits above the flap: without that the flap paints
              over the card and hides the name.
            */}
            <motion.div
              className="absolute inset-x-6 bottom-8 z-50 rounded-sm bg-white px-4 py-6 text-center shadow-lg sm:inset-x-10 sm:bottom-10 sm:py-8"
              initial={{ y: 0, opacity: 0 }}
              animate={opening ? { y: "-215%", opacity: 1 } : { y: 0, opacity: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-foil font-display text-xl tracking-[0.12em] uppercase sm:text-3xl">
                {content.shortName}
              </p>
            </motion.div>

            {/* Envelope body */}
            <div className="relative h-56 w-[21rem] overflow-hidden rounded-sm bg-paper-deep shadow-[0_18px_50px_rgba(44,39,36,0.22)] sm:h-[21rem] sm:w-[32rem]">
              {/* The two diagonal creases on the front */}
              <div
                className="absolute inset-0 z-20"
                style={{
                  background:
                    "linear-gradient(135deg, transparent 49.6%, rgba(44,39,36,0.07) 50%, transparent 50.4%), linear-gradient(225deg, transparent 49.6%, rgba(44,39,36,0.07) 50%, transparent 50.4%)",
                }}
              />
              {/* Front pocket covering the card */}
              <div
                className="absolute inset-x-0 bottom-0 z-30 h-3/5 bg-paper-edge"
                style={{ clipPath: "polygon(0 22%, 50% 0, 100% 22%, 100% 100%, 0 100%)" }}
              />
            </div>

            {/*
              The flap, swinging up and back on open. It needs the perspective
              set on the wrapper: without one, rotateX collapses into a flat
              scaleY(-1), so the flap flips in place and keeps covering the card
              instead of opening.
            */}
            <motion.div
              className="absolute inset-x-0 top-0 z-40 h-28 origin-top sm:h-44"
              style={{ transformStyle: "preserve-3d" }}
              animate={opening ? { rotateX: -165 } : { rotateX: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              <div
                className="h-full w-full bg-[#dbd0bc] shadow-[0_2px_6px_rgba(44,39,36,0.12)]"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
              />
              {/* Wax seal */}
              <div className="absolute top-[68%] left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold shadow-md sm:h-20 sm:w-20">
                <span className="font-display text-xl text-white/90 sm:text-3xl">
                  {initial}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/*
            Chỉ là dòng gợi ý, vùng bấm thật nằm ở chiếc phong bì phía trên.
            aria-hidden để trình đọc màn hình không đọc lặp với nhãn của phong bì.
          */}
          <motion.p
            aria-hidden
            animate={
              opening
                ? { opacity: 0, y: 8 }
                : { opacity: [0.65, 1, 0.65], y: 0 }
            }
            transition={
              opening
                ? { duration: 0.4 }
                : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            }
            className="font-display text-lg tracking-[0.2em] text-ink sm:text-2xl"
          >
            Chạm vào thiệp để mở
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
