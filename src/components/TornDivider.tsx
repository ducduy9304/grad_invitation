/** A torn-paper strip between two blocks, instead of a straight rule. */
export function TornDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div
      aria-hidden
      className={`torn-top h-6 w-full bg-paper-deep ${flip ? "rotate-180" : ""}`}
    />
  );
}
