"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/data/content";

/** Nút nhạc nền nổi ở góc. Mặc định TẮT để không ai bị giật mình khi mở link. */
export function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      // Trình duyệt có thể chặn nếu chưa có tương tác — coi như vẫn đang tắt
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing]);

  if (!content.music) return null;

  return (
    <>
      <audio ref={audioRef} src={content.music} loop preload="none" />
      <button
        type="button"
        onClick={() => setPlaying((v) => !v)}
        aria-label={playing ? "Tắt nhạc nền" : "Bật nhạc nền"}
        aria-pressed={playing}
        className="fixed right-5 bottom-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-white/90 text-base shadow-md backdrop-blur transition hover:bg-white"
      >
        <span aria-hidden>{playing ? "🔊" : "🎵"}</span>
      </button>
    </>
  );
}
