"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/data/content";

/*
 * The card handed to a guest after they RSVP: the invitation with their own
 * name on it, drawn onto a canvas so it can be saved as a picture.
 *
 * Canvas rather than a screenshot of the DOM: the foil lettering is a
 * gradient clipped to the glyphs, which html-to-image libraries render as
 * flat colour or drop entirely. Here the same gradient is the fill style, so
 * what downloads is what the page shows.
 */

const W = 1080;
// Tall enough that the last line of the address clears the bottom edge:
// the drawing is a fixed sequence, so content always ends around y=1433.
const H = 1540;

const INK = "#2c2724";
const PAPER = "#f7f4ee";
const TAPE = "#e3d5b8";

const SERIF = '"Playfair Display", Georgia, serif';
const SANS = '"Be Vietnam Pro", system-ui, sans-serif';

/** The foil gradient from globals.css, as a canvas fill. */
function foil(ctx: CanvasRenderingContext2D, x: number, w: number) {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, "#b8944f");
  g.addColorStop(0.22, "#d9c087");
  g.addColorStop(0.48, "#8e7182");
  g.addColorStop(0.74, "#c9a961");
  g.addColorStop(1, "#a8854a");
  return g;
}

/** Draws text centred on W/2, shrinking the size until it fits `maxWidth`. */
function centred(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  size: number,
  family: string,
  opts: { maxWidth?: number; tracking?: number; fill?: string | CanvasGradient } = {},
) {
  const maxWidth = opts.maxWidth ?? W - 160;
  const tracking = opts.tracking ?? 0;
  let fontSize = size;

  const measure = () => {
    ctx.font = `${fontSize}px ${family}`;
    return ctx.measureText(text).width + tracking * Math.max(0, text.length - 1);
  };

  while (measure() > maxWidth && fontSize > 10) fontSize -= 1;

  const width = measure();
  let x = (W - width) / 2;
  ctx.fillStyle = opts.fill ?? INK;
  ctx.textBaseline = "alphabetic";

  // Letter-spacing has to be applied by hand; canvas has no tracking
  for (const ch of text) {
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + tracking;
  }
  return fontSize;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A strip of washi tape, rotated about its own centre. */
function tape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  deg: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.fillStyle = TAPE;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}

async function draw(canvas: HTMLCanvasElement, guestName: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = W;
  canvas.height = H;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Overline
  let y = 130;
  for (const line of content.overline.split("\n")) {
    centred(ctx, line.toUpperCase(), y, 26, SANS, { tracking: 6 });
    y += 42;
  }

  // Title, foil
  y += 60;
  for (const line of content.title.split("\n")) {
    const size = centred(ctx, line.toUpperCase(), y, 82, SERIF, {
      tracking: 3,
      fill: foil(ctx, 120, W - 240),
      maxWidth: W - 180,
    });
    y += size + 22;
  }

  // Photo in a taped white frame
  const photo = await loadImage(content.heroPhoto.src);
  const frameW = 800;
  const ratio = content.heroPhoto.width / content.heroPhoto.height;
  const imgW = frameW - 28;
  const imgH = Math.round(imgW / ratio);
  const frameH = imgH + 28;
  const frameX = (W - frameW) / 2;
  const frameY = y + 40;

  ctx.save();
  ctx.shadowColor = "rgba(44,39,36,0.22)";
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(frameX, frameY, frameW, frameH);
  ctx.restore();
  if (photo) ctx.drawImage(photo, frameX + 14, frameY + 14, imgW, imgH);
  tape(ctx, frameX + 26, frameY + 8, 150, 42, -38);

  // The guest's own name
  y = frameY + frameH + 86;
  centred(ctx, content.card.invitePrefix.toUpperCase(), y, 26, SANS, { tracking: 7 });
  y += 78;
  centred(ctx, guestName.toUpperCase(), y, 72, SERIF, {
    tracking: 3,
    fill: foil(ctx, 120, W - 240),
    maxWidth: W - 200,
  });

  // Date strip on a taped white band
  const bandY = y + 54;
  const bandH = 150;
  ctx.save();
  ctx.shadowColor = "rgba(44,39,36,0.14)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(110, bandY, W - 220, bandH);
  ctx.restore();
  tape(ctx, 120, bandY + 12, 150, 40, -12);
  tape(ctx, W - 120, bandY + bandH - 12, 150, 40, -12);

  const mid = bandY + bandH / 2;
  ctx.fillStyle = INK;
  ctx.font = `30px ${SERIF}`;
  ctx.textAlign = "center";
  ctx.fillText(content.date.weekday.toUpperCase(), 270, mid + 12);
  ctx.font = `26px ${SERIF}`;
  ctx.fillText(content.date.month, W / 2, mid - 18);
  ctx.font = `74px ${SERIF}`;
  ctx.fillText(content.date.day, W / 2, mid + 48);
  ctx.font = `30px ${SERIF}`;
  ctx.fillText(content.time.range, W - 270, mid + 12);
  ctx.textAlign = "left";

  // Venue
  let vy = bandY + bandH + 76;
  centred(ctx, `📍 ${content.venue.floor}, ${content.venue.name}`, vy, 26, SANS, {
    tracking: 1,
  });
  vy += 42;
  centred(ctx, content.venue.lines.join(", "), vy, 26, SANS, { tracking: 1 });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function GuestCard({ guestName }: { guestName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Canvas paints with whatever font is loaded at that moment, so wait
      await document.fonts.ready;
      if (cancelled || !canvasRef.current) return;
      await draw(canvasRef.current, guestName);
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [guestName]);

  function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thiep-moi-${slug(guestName)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-md">
      <canvas
        ref={canvasRef}
        aria-label={`Thiệp mời dành cho ${guestName}`}
        className={`w-full rounded-sm shadow-[0_12px_34px_rgba(44,39,36,0.2)] transition-opacity duration-500 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={save}
          disabled={!ready}
          className="rounded-full bg-gradient-to-r from-gold to-gold-light px-6 py-3 text-base font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          {content.card.saveLabel}
        </button>
        <a
          href={content.venue.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-gold/50 px-6 py-3 text-center text-base text-gold transition hover:bg-gold hover:text-white"
        >
          {content.card.mapLabel}
        </a>
      </div>

      <p className="mt-3 text-center text-sm text-ink/60">
        {content.card.longPressHint}
      </p>
    </div>
  );
}

function slug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "khach-moi";
}
