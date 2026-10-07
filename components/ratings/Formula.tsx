import type { ReactNode } from "react";

/**
 * The few bits of typesetting a written-out sum needs.
 *
 * Set in a serif, variables in italic and numbers upright, which is how
 * arithmetic is written everywhere outside a terminal. On one line and in a
 * monospace font the expected-score formula is four nested brackets deep and
 * has to be parsed rather than read; stacked, the division is the thing you
 * see first.
 *
 * Drawn rather than typeset by a library: this is a few sums in a side panel,
 * and MathML is not in the JSX types, so the choice was a stack of element
 * declarations or a stack of spans.
 */

/**
 * One numerator over one denominator, with the rule between them. The
 * denominator is given room above it, so a power raised off it clears the
 * rule rather than running into it.
 */
export function Frac({ over, under }: { over: ReactNode; under: ReactNode }) {
  return (
    <span className="mx-1 inline-flex flex-col items-center align-middle">
      <span className="px-2 pb-1">{over}</span>
      <span className="w-full border-t border-current px-2 pt-2.5 text-center">{under}</span>
    </span>
  );
}

/** A name for a quantity, as opposed to a number. */
export function Var({ children }: { children: ReactNode }) {
  return <span className="italic">{children}</span>;
}

/**
 * A power, raised and smaller. Written on one line, with a slash for any
 * division in it, as powers are in print: a fraction stacked inside a power
 * is too small to read and too tall to sit on its base.
 */
export function Sup({ children }: { children: ReactNode }) {
  return (
    <span className="relative -top-[0.75em] ml-0.5 inline-block whitespace-nowrap text-[0.72em] leading-none">
      {children}
    </span>
  );
}

/**
 * One line of the working: what is being worked out, the sum for it, and
 * a word on it underneath in the ordinary type, so the note never pushes
 * the sum into wrapping.
 *
 * A grid rather than a run of text, so every equals sign lines up down the
 * column however long the left-hand side is.
 */
export function Line({
  name,
  note,
  children,
}: {
  name: ReactNode;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <dt className="self-center justify-self-end whitespace-nowrap text-right text-muted-foreground">
        <Var>{name}</Var>
      </dt>
      <dd className="flex min-w-0 flex-wrap items-center whitespace-nowrap">
        <span className="mr-2 text-muted-foreground">=</span>
        {children}
      </dd>
      {/* A row of its own, so the name stays level with the sum. */}
      {note && (
        <dd className="col-start-2 -mt-3.5 pl-5 font-sans text-xs text-muted-foreground">{note}</dd>
      )}
    </>
  );
}

/** The block the lines sit in. */
export function Working({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-5 overflow-x-auto rounded-lg border border-border bg-surface-2/40 p-4 font-serif text-base text-foreground">
      {children}
    </dl>
  );
}
