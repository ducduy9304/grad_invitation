import { content } from "@/data/content";
import { Reveal } from "./Reveal";

export function Footer() {
  return (
    <footer className="bg-paper-deep px-6 py-14 text-center">
      <Reveal>
        <p className="mx-auto max-w-3xl text-base leading-relaxed text-balance text-ink">
          {content.footer.thanks}
        </p>
        <p className="text-foil mt-5 font-display text-2xl">
          {content.footer.signature}
        </p>
        <p className="mt-2 text-base leading-relaxed text-ink">
          {content.footer.closing}
        </p>
      </Reveal>
    </footer>
  );
}
