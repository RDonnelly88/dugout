import type { Ledger } from "@/lib/expected-wins";
import type { PointValues } from "@/lib/season-positions";
import { listTone, pointsPerGame } from "@/lib/measure";
import { cn } from "@/lib/utils";

const FILL = { ahead: "bg-win", behind: "bg-loss", level: "bg-border-strong" } as const;

/**
 * Points a game as a bar out of a win's worth, with a tick at the baseline it
 * is read against: the record's answer to the luck band. Decoration beside a
 * number that says the same, so it is hidden from screen readers.
 */
export default function PointsBar({
  ledger,
  values,
  baseline,
  className,
}: {
  ledger: Ledger;
  values: PointValues;
  baseline: number;
  className?: string;
}) {
  const share = (n: number) => `${Math.max(0, Math.min(100, (n / values.win) * 100))}%`;
  return (
    <div className={cn("relative h-2 rounded-full bg-surface-2", className)} aria-hidden>
      <div
        className={cn("h-full rounded-full", FILL[listTone(ledger, "record", values, baseline)])}
        style={{ width: share(pointsPerGame(ledger, values)) }}
      />
      <div
        className="absolute -top-0.5 h-3 w-0.5 rounded-full bg-foreground/60"
        style={{ left: share(baseline) }}
      />
    </div>
  );
}
