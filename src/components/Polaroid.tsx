import Image from "next/image";

/**
 * A taped photo frame, tilted slightly like it was stuck into a scrapbook.
 *
 * Two sizing modes:
 *  - Pass width/height: the frame follows the file's real aspect ratio.
 *  - Omit them: the frame uses the fixed `ratio` and the photo is cropped to fit.
 */
export function Polaroid({
  src,
  alt,
  caption,
  width,
  height,
  rotate = -2,
  priority = false,
  /** Only used when width/height are not given. */
  ratio = "4 / 3",
  /** "top" tapes one strip across the top edge, "corner" tapes diagonally over the top-left. */
  tape = "top",
  /**
   * Class that caps the photo height, e.g. "max-h-[20rem]".
   * When set, the frame shrinks to hug the photo instead of filling the row.
   */
  fitHeight,
  sizes = "(max-width: 768px) 88vw, 560px",
  className = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  rotate?: number;
  priority?: boolean;
  ratio?: string;
  tape?: "top" | "corner";
  fitHeight?: string;
  sizes?: string;
  className?: string;
}) {
  const intrinsic = width !== undefined && height !== undefined;

  return (
    <figure
      className={`relative bg-white shadow-[0_12px_34px_rgba(44,39,36,0.2)] ${
        caption ? "pb-10" : ""
      } p-2.5 ${fitHeight ? "mx-auto w-fit max-w-full" : ""} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {tape === "top" ? (
        <span className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-2" />
      ) : (
        /* Taped diagonally across the top-left corner, overhanging the edge */
        <span className="tape -top-4 -left-7 z-10 w-28 -rotate-[38deg]" />
      )}

      {intrinsic ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className={`block bg-paper-deep ${
            fitHeight ? `h-auto w-auto max-w-full ${fitHeight}` : "h-auto w-full"
          }`}
        />
      ) : (
        <div
          className="relative w-full overflow-hidden bg-paper-deep"
          style={{ aspectRatio: ratio }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover"
          />
        </div>
      )}

      {caption && (
        <figcaption className="absolute inset-x-0 bottom-3 text-center font-display text-base tracking-wide text-ink">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
