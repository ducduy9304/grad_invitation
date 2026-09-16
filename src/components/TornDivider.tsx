/** Dải giấy xé ngăn giữa hai khối, thay cho đường kẻ thẳng. */
export function TornDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div
      aria-hidden
      className={`torn-top h-6 w-full bg-paper-deep ${flip ? "rotate-180" : ""}`}
    />
  );
}
