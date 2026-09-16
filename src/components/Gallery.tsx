import { content } from "@/data/content";
import { Polaroid } from "./Polaroid";
import { Reveal } from "./Reveal";

const tilts = [-3, 2, -1.5, 3, -2.5, 1.5];

export function Gallery() {
  if (content.gallery.length === 0) return null;

  return (
    <section className="px-6 py-16">
      <Reveal>
        <h2 className="text-center text-2xl font-semibold tracking-wide text-ink sm:text-3xl">
          Một chút kỷ niệm
        </h2>
      </Reveal>

      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
        {content.gallery.map((photo, i) => (
          <Reveal key={photo.src} delay={i * 0.07}>
            <Polaroid
              src={photo.src}
              alt={photo.alt}
              caption={photo.caption}
              rotate={tilts[i % tilts.length]}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
