import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A heading that opens a part of a page, between its cards: a small kicker
 * over a big title, numbered where the parts are steps to take in order.
 *
 * Card titles stay `CardTitle`; this is for the headings the cards sit under.
 */
export default function SectionHeading({
  title,
  kicker,
  number,
  id,
  as: Tag = "h2",
  actions,
  className,
}: {
  title: ReactNode;
  kicker?: ReactNode;
  /** A step in a sequence, shown as 01, 02 beside the kicker. */
  number?: number;
  id?: string;
  as?: "h2" | "h3";
  /** Anything to sit at the end of the heading's line: a toggle, a link. */
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2", className)}>
      <div className="min-w-0">
        {(kicker || number !== undefined) && (
          <p className="page-kicker mb-2 flex items-center gap-3">
            {number !== undefined && (
              <span className="scoreboard text-base tracking-normal">
                {String(number).padStart(2, "0")}
              </span>
            )}
            {number !== undefined && kicker && <span className="h-px w-8 bg-accent" aria-hidden />}
            {kicker}
          </p>
        )}
        <Tag id={id} className="section-heading">
          {title}
        </Tag>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
