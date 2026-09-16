"use client";

import { useEffect, useState } from "react";
import { content } from "@/data/content";

const target = new Date(content.eventStart).getTime();
const UNITS = [
  { key: "days", label: "Ngày" },
  { key: "hours", label: "Giờ" },
  { key: "minutes", label: "Phút" },
  { key: "seconds", label: "Giây" },
] as const;

type Parts = Record<(typeof UNITS)[number]["key"], number>;

function remaining(): Parts {
  // Kẹp về 0 để sau ngày lễ không hiện số âm
  const ms = Math.max(0, target - Date.now());
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  };
}

/** Bốn ô đếm ngược, đặt ngay trong hero nên không tự bọc section. */
export function Countdown() {
  // Bắt đầu bằng null để server và client khớp nhau, tránh lỗi hydration
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    setParts(remaining());
    const id = window.setInterval(() => setParts(remaining()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (parts !== null && Object.values(parts).every((v) => v === 0)) {
    return (
      <p className="text-foil font-display text-2xl">Hôm nay là ngày đó rồi! 🎓</p>
    );
  }

  return (
    <div className="grid w-full max-w-sm grid-cols-4 gap-2.5">
      {UNITS.map(({ key, label }) => {
        const value = parts ? String(parts[key]).padStart(2, "0") : "––";
        return (
          <div
            key={key}
            className="rounded-sm bg-white px-1 py-[clamp(0.4rem,1.2svh,0.75rem)] shadow-[0_6px_18px_rgba(44,39,36,0.1)]"
          >
            <div className="h-[clamp(1.9rem,4svh,2.75rem)] overflow-hidden">
              {/*
                Đổi key -> React thay phần tử -> animation CSS chạy lại.
                Không dùng AnimatePresence vì node thoát bị kẹt lại trong DOM.
              */}
              <span
                key={value}
                className="roll-in flex h-full items-center justify-center font-display text-[clamp(1.35rem,3.4svh,1.875rem)] text-ink tabular-nums"
              >
                {value}
              </span>
            </div>
            <span className="mt-1 block text-[11px] tracking-[0.14em] text-ink uppercase">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
