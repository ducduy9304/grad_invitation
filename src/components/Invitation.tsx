"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Envelope } from "./Envelope";
import { Hero } from "./Hero";
import { EventInfo } from "./EventInfo";
import { Parking } from "./Parking";
import { Gallery } from "./Gallery";
import { Rsvp } from "./Rsvp";
import { Footer } from "./Footer";
import { MusicToggle } from "./MusicToggle";
import { TornDivider } from "./TornDivider";

export function Invitation() {
  const [opened, setOpened] = useState(false);

  // Lock scrolling while the envelope is still closed
  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  return (
    <>
      <Envelope onOpen={() => setOpened(true)} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: opened ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        aria-hidden={!opened}
      >
        <Hero />
        <TornDivider />
        <div className="bg-paper-deep">
          <EventInfo />
        </div>
        <Parking />
        <Gallery />
        <TornDivider />
        <div className="bg-paper-deep">
          <Rsvp />
        </div>
        <Footer />
      </motion.main>

      {opened && <MusicToggle />}
    </>
  );
}
