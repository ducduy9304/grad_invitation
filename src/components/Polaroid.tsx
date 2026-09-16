import Image from "next/image";

/**
 * Khung ảnh dán băng keo, nghiêng nhẹ như dán tay vào sổ.
 *
 * Có hai cách dựng khung:
 *  - Truyền width/height: khung bám đúng tỉ lệ thật của file ảnh.
 *  - Không truyền: khung dùng tỉ lệ cố định ở `ratio`, ảnh bị cắt cho vừa.
 */
export function Polaroid({
  src,
  alt,
  caption,
  width,
  height,
  rotate = -2,
  priority = false,
  /** Chỉ dùng khi không có width/height. */
  ratio = "4 / 3",
  /** "top" dán một miếng giữa cạnh trên, "corner" dán chéo góc trái. */
  tape = "top",
  /**
   * Class kẹp chiều cao ảnh, ví dụ "max-h-[20rem]".
   * Có giá trị thì khung co lại ôm sát ảnh thay vì chiếm hết bề ngang.
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
        /* Dán vắt chéo qua góc trên bên trái, thò ra ngoài mép ảnh */
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
