"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";
import type { Slot } from "@/lib/team-picker";

/**
 * One of the two sides, or the bench.
 *
 * Keeps its outline when empty rather than collapsing, so there is somewhere
 * to aim at when the last player has been dragged off it.
 */
export default function DropZone({
  slot,
  title,
  count,
  meanRating,
  children,
}: {
  slot: Slot;
  title: string;
  count: number;
  /** Average rating of whoever is standing here, when there is anybody. */
  meanRating?: number;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slot });

  return (
    <section
      ref={setNodeRef}
      aria-label={title}
      className={`flex min-h-[7rem] flex-col rounded-xl border-2 border-dashed p-3 transition-colors ${
        isOver ? "border-accent bg-accent/10" : "border-border bg-surface-2/40"
      }`}
    >
      <header className="mb-2 flex items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        <span className="tabular text-xs text-muted-foreground">
          {count}
          {meanRating !== undefined && count > 0 && ` · ${Math.round(meanRating)}`}
        </span>
      </header>
      <div className="flex flex-1 flex-col gap-1.5">{children}</div>
    </section>
  );
}
