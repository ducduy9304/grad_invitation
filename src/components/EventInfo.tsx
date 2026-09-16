import { content } from "@/data/content";
import { Reveal } from "./Reveal";

const cards = [
  {
    icon: "📅",
    title: "Ngày",
    body: [content.date.full, content.date.weekday],
  },
  {
    icon: "⏰",
    title: "Giờ",
    body: [content.time.range],
  },
  {
    icon: "📍",
    title: "Địa điểm",
    /** Stands out above the address, guests look for the floor first. */
    lead: content.venue.floor,
    body: [content.venue.name, ...content.venue.lines],
    href: content.venue.mapsUrl,
  },
];

export function EventInfo() {
  return (
    <section className="px-6 py-16">
      <Reveal>
        <h2 className="text-center font-display text-3xl tracking-wide text-ink">
          Thông tin buổi lễ
        </h2>
      </Reveal>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
        {cards.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.08}>
            <article
              className="relative flex h-full flex-col items-center bg-white px-5 py-8 text-center shadow-[0_8px_24px_rgba(44,39,36,0.1)]"
              style={{ transform: `rotate(${(i - 1) * 0.8}deg)` }}
            >
              <span className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-3" />
              <span className="text-2xl" aria-hidden>
                {card.icon}
              </span>
              <h3 className="mt-3 text-base font-semibold tracking-[0.2em] text-foil uppercase">
                {card.title}
              </h3>
              <div className="mt-4 space-y-1.5 text-base leading-relaxed text-ink">
                {card.lead && <p className="font-semibold">{card.lead}</p>}
                {card.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              {card.href && (
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 rounded-full border border-gold/50 px-6 py-2.5 text-sm tracking-[0.15em] text-gold uppercase transition hover:bg-gold hover:text-white"
                >
                  Chỉ đường
                </a>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
