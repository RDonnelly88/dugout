import type { ReactNode } from "react";
import Counter from "@/components/Counter";

/**
 * One figure with a label under it.
 *
 * The same idea appeared in five places in four shapes: a tinted pill on the
 * season page, a bordered box on the season card, a centred column on the
 * player card, and two different grids on the dashboard. They are all this.
 *
 * A figure that is a number counts up to itself. Doing it here rather than at
 * the call sites is what keeps every tile in the app behaving the same way.
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "plain",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** Colours the figure. The label and box stay neutral either way. */
  tone?: "plain" | "win" | "draw" | "loss" | "accent";
}) {
  const colour = {
    plain: "text-foreground",
    win: "text-win",
    draw: "text-draw",
    loss: "text-loss",
    accent: "text-accent",
  }[tone];

  return (
    <div className="rounded-lg border border-border bg-surface-2/50 p-3 text-center">
      <p className={`tabular text-xl font-bold ${colour}`}>
        {typeof value === "number" ? <Counter value={value} /> : value}
      </p>
      <p className="eyebrow mt-0.5">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** A row of them, wrapping on a phone. */
export function StatTiles({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{children}</div>;
}
