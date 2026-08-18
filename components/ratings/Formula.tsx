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
 * Drawn rather than typeset by a library: this is four sums in a side panel,
 * and MathML is not in the JSX types, so the choice was a stack of element
 * declarations or a stack of spans.
 */

/** One numerator over one denominator, with the rule between them. */
export function Frac({ over, under }: { over: ReactNode; under: ReactNode }) {
  return (
    <span className="mx-1 inline-flex flex-col items-center align-middle">
      <span className="px-1.5 pb-0.5">{over}</span>
      <span className="w-full border-t border-current px-1.5 pt-0.5 text-center">
        {under}
      </span>
    </span>
  );
}

/** A name for a quantity, as opposed to a number. */
export function Var({ children }: { children: ReactNode }) {
  return <span className="italic">{children}</span>;
}

export function Sup({ children }: { children: ReactNode }) {
  // `text-[0.7em]` rather than a fixed size, so an exponent inside an
  // exponent keeps shrinking.
  return (
    <sup className="ml-px align-super text-[0.7em] leading-none">{children}</sup>
  );
}

/** Multiplication, spaced as an operator rather than jammed against a name. */
export function Times() {
  return <span className="mx-1.5 text-muted-foreground">×</span>;
}

/**
 * One line of the working: what is being worked out, and the sum for it.
 *
 * A grid rather than a run of text, so every equals sign lines up down the
 * column however long the left-hand side is.
 */
export function Line({ name, children }: { name: ReactNode; children: ReactNode }) {
  return (
    <>
      <dt className="self-center justify-self-end text-right text-muted-foreground">
        <Var>{name}</Var>
      </dt>
      <dd className="flex items-center self-center">
        <span className="mr-2 text-muted-foreground">=</span>
        <span className="flex items-center">{children}</span>
      </dd>
    </>
  );
}

/** The block the lines sit in. */
export function Working({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] items-center gap-x-1 gap-y-4 overflow-x-auto rounded-lg border border-border bg-surface-2/40 p-4 font-serif text-sm text-foreground">
      {children}
    </dl>
  );
}
