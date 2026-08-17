"use client";

import { useDraggable } from "@dnd-kit/core";
import { Check } from "lucide-react";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { displayRating } from "@/lib/elo";
import type { Player } from "@/types";

/**
 * One player, pickable and draggable.
 *
 * A tap picks them out rather than moving them, so several can be gathered
 * up and sent across together. The drag is the same gesture continued, which
 * is why the whole chip is the handle rather than a grab dot on the end of
 * it — a dot is a small target on a phone and invisible to anybody who has
 * not met one before.
 */
export default function PlayerChip({
  player,
  rating,
  selected,
  onToggle,
  dimmed,
}: {
  player: Player;
  rating?: number;
  selected: boolean;
  onToggle: () => void;
  /** Being carried somewhere else, so it is left behind faintly. */
  dimmed?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: player.id,
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`focus-ring tap flex w-full touch-none items-center gap-2 rounded-lg border p-2 text-left transition-colors ${
        selected
          ? "border-accent bg-accent/10"
          : "border-border bg-surface hover:border-accent/50"
      } ${isDragging || dimmed ? "opacity-40" : ""}`}
    >
      <span className="relative shrink-0">
        <PlayerAvatar name={player.name} image={player.image} size="xs" />
        {selected && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Check className="h-2.5 w-2.5" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm">{player.name}</span>
      {rating !== undefined && (
        <span className="shrink-0 tabular text-xs text-muted-foreground">
          {displayRating(rating)}
        </span>
      )}
    </button>
  );
}
