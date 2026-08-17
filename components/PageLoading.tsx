/**
 * The wait before a page can say anything.
 *
 * One component because the alternative is every page inventing its own, and
 * two of them had: a grid of shimmering cards on one, a single bar on
 * another, and several places with nothing at all — which is the worst of the
 * three, because a page with no answer yet and no sign of waiting looks like
 * a page whose answer is "nothing".
 *
 * Blocks rather than spins. A spinner says only that something is happening;
 * a shape the size of what is coming says what, and does not shift the page
 * about when the real thing arrives.
 */
export default function PageLoading({
  /** Roughly how many blocks are coming, so the space is about right. */
  rows = 3,
  label = "Loading",
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <output aria-busy="true" className="block space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="sheen h-24 rounded-xl" />
      ))}
    </output>
  );
}
