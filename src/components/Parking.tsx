import { content } from "@/data/content";
import { Reveal } from "./Reveal";

export function Parking() {
  const { heading, intro, spots, note } = content.parking;

  return (
    <section className="px-6 py-16">
      <Reveal>
        <h2 className="text-center text-2xl font-semibold tracking-wide text-ink sm:text-3xl">
          {heading}
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-base leading-relaxed text-balance text-ink">
          {intro}
        </p>
      </Reveal>

      <ul className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
        {spots.map((spot, i) => (
          <li key={spot.url}>
            <Reveal delay={i * 0.06} className="h-full">
              {/* The whole tile is one link, so tapping anywhere opens the map */}
              <a
                href={spot.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col bg-white px-5 py-5 shadow-[0_6px_18px_rgba(44,39,36,0.1)] transition hover:shadow-[0_10px_26px_rgba(44,39,36,0.16)]"
              >
                <span className="text-xs font-medium tracking-[0.18em] text-gold uppercase">
                  {spot.rank}
                </span>
                <span className="mt-2 text-lg font-semibold leading-snug text-ink">
                  {spot.name}
                </span>
                {spot.address && (
                  <span className="mt-1 text-base leading-relaxed text-ink">
                    {spot.address}
                  </span>
                )}
                <span className="mt-4 text-sm tracking-[0.15em] text-gold uppercase underline-offset-4 group-hover:underline">
                  Mở bản đồ →
                </span>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>

      <Reveal delay={0.1}>
        <p className="mx-auto mt-8 max-w-xl text-center text-base leading-relaxed text-ink">
          {note}
        </p>
      </Reveal>
    </section>
  );
}
