"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, PackageOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import type { Split } from "@/lib/team-balance";
import type { Player } from "@/types";
import { SIDE_NAMES } from "@/lib/config";

/**
 * Dealing the sides out, one card at a time.
 *
 * The teams arrive already decided — this only chooses the order they are
 * revealed in, so the drama does not change the answer. Dealing alternately
 * and calling that the result is what made "even by rating" do nothing.
 */
export default function CardPackRandomizer({
  split,
  onComplete,
  onCancel,
}: {
  split: Split<Player>;
  onComplete: (teamA: Player[], teamB: Player[]) => void;
  onCancel: () => void;
}) {
  const reduced = useReducedMotion();

  // Interleaved so the two sides fill up together; a run of five on one side
  // reads as the deal having gone wrong.
  const order = useMemo(() => {
    const queue: { player: Player; side: "A" | "B" }[] = [];
    const longest = Math.max(split.teamA.length, split.teamB.length);
    for (let i = 0; i < longest; i++) {
      if (split.teamA[i]) queue.push({ player: split.teamA[i], side: "A" });
      if (split.teamB[i]) queue.push({ player: split.teamB[i], side: "B" });
    }
    return queue;
  }, [split]);

  const [revealed, setRevealed] = useState(0);
  const done = revealed >= order.length;
  const current = order[revealed - 1];

  const shown = (side: "A" | "B") =>
    order.slice(0, revealed).filter((c) => c.side === side).map((c) => c.player);

  return (
    <div>
      <DialogTitle className="text-center text-xl font-bold">
        {done ? "Teams are set" : "Deal the teams"}
      </DialogTitle>
      <DialogDescription className="mt-1 text-center text-sm text-muted-foreground">
        {done
          ? "Happy with that?"
          : `${order.length - revealed} still to come`}
      </DialogDescription>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(["A", "B"] as const).map((side) => (
          <div key={side} className="rounded-xl border border-border bg-surface-2/50">
            <div
              className={`rounded-t-xl px-4 py-2 text-center text-sm font-semibold ${
                side === "A"
                  ? "bg-info/15 text-info"
                  : "bg-accent/15 text-accent"
              }`}
            >
              {SIDE_NAMES[side]}
            </div>
            <ul className="min-h-[180px] space-y-1 p-2">
              <AnimatePresence initial={false}>
                {shown(side).map((player) => (
                  <motion.li
                    key={player.id}
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0, x: side === "A" ? -12 : 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 rounded-lg bg-surface px-2 py-1.5"
                  >
                    <PlayerAvatar name={player.name} image={player.image} size="xs" />
                    <span className="truncate text-sm" data-testid="dealt-name">
                      {player.name}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
              {shown(side).length === 0 && (
                <li className="py-10 text-center text-sm text-muted-foreground">
                  Nobody yet
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        {!done ? (
          <>
            {current && (
              <motion.div
                key={current.player.id}
                initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3"
              >
                <PlayerAvatar
                  name={current.player.name}
                  image={current.player.image}
                  size="md"
                />
                <div>
                  <p className="font-semibold">{current.player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    to {SIDE_NAMES[current.side]}
                  </p>
                </div>
              </motion.div>
            )}
            <Button onClick={() => setRevealed((r) => r + 1)} className="gap-2">
              <PackageOpen className="h-4 w-4" />
              {revealed === 0 ? "Turn the first card" : "Next"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setRevealed(order.length)}>
              Skip to the end
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => onComplete(split.teamA, split.teamB)}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Use these teams
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
              <X className="h-4 w-4" />
              Start again
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
