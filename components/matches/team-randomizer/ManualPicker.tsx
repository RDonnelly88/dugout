"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useReducedMotion } from "motion/react";
import { ArrowLeftRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useSideNames } from "@/hooks/useSideNames";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import {
  assign,
  boardFrom,
  dragged,
  occupants,
  swapSides,
  usable,
  type Board,
  type Slot,
} from "@/lib/team-picker";
import type { Split } from "@/lib/team-balance";
import type { Player } from "@/types";
import PlayerChip from "./PlayerChip";
import DropZone from "./DropZone";

const mean = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined;

/**
 * Sorting the players into two sides by hand.
 *
 * Opens on a shuffle rather than an empty board, because starting from two
 * roughly even sides and moving three people is far less work than placing
 * everyone one at a time.
 *
 * Two ways to move somebody, because neither suits both hands. Tapping picks
 * players out and the buttons send the lot across at once, which is the quick
 * way on a phone and the only way with a keyboard. Dragging is the obvious
 * way with a mouse, and carries the whole selection when the player picked up
 * is part of it.
 */
export default function ManualPicker({
  players,
  start,
  onComplete,
  onCancel,
}: {
  players: Player[];
  /** The arrangement to open on. */
  start: Split<Player>;
  onComplete: (teamA: Player[], teamB: Player[]) => void;
  onCancel: () => void;
}) {
  const sides = useSideNames();
  const { ratingFor } = usePlayerRatings();
  const reduced = useReducedMotion();

  const [board, setBoard] = useState<Board>(() => boardFrom(start, players));
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [carrying, setCarrying] = useState<string | null>(null);

  const sensors = useSensors(
    // A little travel before a drag starts, so a tap stays a tap.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // On a touch screen the same movement is a scroll, so a drag has to be
    // asked for by holding still first.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const inSlot = (slot: Slot) => occupants(board, slot, players);
  const teamA = inSlot("A");
  const teamB = inSlot("B");
  const bench = inSlot("bench");

  const averageOf = (side: Player[]) =>
    mean(
      side.flatMap((p) => {
        const rating = ratingFor(p.id)?.rating;
        return rating === undefined ? [] : [rating];
      })
    );

  const move = (ids: Iterable<string>, slot: Slot) => {
    setBoard((prev) => assign(prev, ids, slot));
    setPicked(new Set());
  };

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onDragStart = (event: DragStartEvent) =>
    setCarrying(String(event.active.id));

  const onDragEnd = (event: DragEndEvent) => {
    setCarrying(null);
    const slot = event.over?.id;
    if (!slot) return;
    move(dragged(String(event.active.id), picked), slot as Slot);
  };

  const carried = useMemo(
    () => (carrying ? dragged(carrying, picked) : new Set<string>()),
    [carrying, picked]
  );
  const carriedPlayer = players.find((p) => p.id === carrying);

  const zone = (slot: Slot, title: string, side: Player[]) => (
    <DropZone
      slot={slot}
      title={title}
      count={side.length}
      meanRating={averageOf(side)}
    >
      {side.map((player) => (
        <PlayerChip
          key={player.id}
          player={player}
          rating={ratingFor(player.id)?.rating}
          selected={picked.has(player.id)}
          onToggle={() => toggle(player.id)}
          dimmed={carrying !== null && carried.has(player.id)}
        />
      ))}
      {side.length === 0 && (
        <p className="m-auto text-xs text-muted-foreground">Drop players here</p>
      )}
    </DropZone>
  );

  return (
    <div>
      <DialogTitle className="text-center text-xl font-bold">
        Pick the teams
      </DialogTitle>
      <DialogDescription className="mt-1 text-center text-sm text-muted-foreground">
        Tap to pick players out, then send them across — or drag them over.
      </DialogDescription>

      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBoard(swapSides)}
          className="gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Swap the sides over
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setCarrying(null)}
      >
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {zone("A", sides.A, teamA)}
          {zone("B", sides.B, teamB)}
        </div>

        <div className="mt-3">{zone("bench", "Not playing", bench)}</div>

        <DragOverlay dropAnimation={reduced ? null : undefined}>
          {carriedPlayer && (
            <div className="rounded-lg border border-accent bg-surface p-2 text-sm shadow-lg">
              {carried.size > 1
                ? `${carried.size} players`
                : carriedPlayer.name}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {picked.size > 0 && (
        <div className="sticky bottom-0 mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface/95 p-3 backdrop-blur">
          <span className="text-sm font-medium">
            {picked.size} picked out
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" onClick={() => move(picked, "A")}>
              Send to {sides.A}
            </Button>
            <Button size="sm" onClick={() => move(picked, "B")}>
              Send to {sides.B}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => move(picked, "bench")}
            >
              Bench
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPicked(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        <Button
          onClick={() => onComplete(teamA, teamB)}
          disabled={!usable(board)}
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          Use these teams
        </Button>
        {!usable(board) && (
          <p className="text-xs text-muted-foreground">
            Both sides need at least one player.
          </p>
        )}
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
