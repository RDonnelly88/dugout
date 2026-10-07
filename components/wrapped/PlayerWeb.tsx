"use client";

import { useMemo, useState } from "react";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import MinGamesStepper, { MIN_GAMES } from "@/components/MinGamesStepper";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import type { Ledger } from "@/lib/expected-wins";
import type { PointValues } from "@/lib/season-positions";
import type { WrappedPartner } from "@/lib/season-wrapped";
import { enoughGames, firmness, lean, pointsPerGame, ppg, tone } from "@/lib/measure";
import { cn } from "@/lib/utils";
import type { Player } from "@/types";

/** The drawing's own units; it scales to the card. */
const SIZE = 340;
const CENTRE = SIZE / 2;
const RING = 108;
const NODE = 28;
/** Where the names sit, just outside the faces. */
const LABEL = RING + NODE / 2 + 8;

/**
 * To a hundredth: the server and the browser can disagree about the last
 * digits of a sine, and the page as served must match the page as hydrated.
 */
const px = (value: number) => Math.round(value * 100) / 100;

const STROKE = { ahead: "stroke-win", behind: "stroke-loss", level: "stroke-border-strong" } as const;
const TEXT = { ahead: "text-win", behind: "text-loss", level: "text-muted-foreground" } as const;

/**
 * One player's season as a web: them in the middle, everybody they played
 * with — or against — round them, a spoke to each.
 *
 * Read on the record, because a wrapped is about what happened: a spoke is
 * green where they took more points a game with that player than they did
 * across their whole season, and red where fewer. A thicker spoke is more
 * games, and a faint one too few to say much. The ring runs best first,
 * clockwise from the top. Tap a face for the numbers.
 */
export default function PlayerWeb({
  player,
  own,
  mates,
  opponents,
  playerFor,
  values,
  across = "the season",
  everyone = false,
}: {
  player: Player;
  /** Their own season, the baseline a spoke is read against. */
  own: Ledger;
  mates: WrappedPartner[];
  opponents: WrappedPartner[];
  playerFor: (id: string) => Player | undefined;
  /** What a win and a draw were worth this season, read off its table. */
  values: PointValues;
  /** The stretch the baseline covers, as the caption names it. */
  across?: string;
  /**
   * Everybody they shared a pitch with, however few games, and no control
   * to thin them: a wrapped is the whole season, not a filtered view of it.
   */
  everyone?: boolean;
}) {
  const [side, setSide] = useState<"with" | "against">("with");
  const [minGames, setMinGames] = useState(MIN_GAMES);
  const measure = "record";
  const points = values;
  const baseline = pointsPerGame(own, points);

  const all = side === "with" ? mates : opponents;
  // Never past the most games anybody has, so the ring always keeps the
  // people they have played most with, however short the stretch.
  const mostAny = Math.max(1, ...all.map((e) => e.ledger.played));
  const threshold = everyone ? 1 : Math.min(minGames, mostAny);
  const entries = useMemo(() => all.filter((e) => e.ledger.played >= threshold), [all, threshold]);
  const ring = useMemo(
    () =>
      [...entries].sort(
        (x, y) =>
          lean(y.ledger, measure, points, baseline) - lean(x.ledger, measure, points, baseline) ||
          y.ledger.played - x.ledger.played
      ),
    [entries, measure, points, baseline]
  );
  const most = Math.max(1, ...ring.map((e) => e.ledger.played));
  const [picked, setPicked] = useState<string | null>(null);
  // The best of them until somebody is tapped; a stale pick from the other
  // side of the toggle falls back the same way.
  const selected = ring.find((e) => e.playerId === picked) ?? ring[0];

  const seat = (i: number) => {
    const angle = -Math.PI / 2 + (i / Math.max(ring.length, 1)) * Math.PI * 2;
    return {
      x: px(CENTRE + RING * Math.cos(angle)),
      y: px(CENTRE + RING * Math.sin(angle)),
      cos: Math.cos(angle),
      lx: px(CENTRE + LABEL * Math.cos(angle)),
      ly: px(CENTRE + LABEL * Math.sin(angle) + 4),
    };
  };
  const name = (id: string) => playerFor(id)?.name ?? "Unknown";
  const first = (id: string) => name(id).split(/\s+/)[0];

  if (all.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <SegmentedControl
          label="Team-mates or opponents"
          value={side}
          onValueChange={(next) => setSide(next as "with" | "against")}
          className="h-8"
        >
          <SegmentedControlItem value="with" className="h-full px-3 text-xs font-medium">
            With
          </SegmentedControlItem>
          <SegmentedControlItem value="against" className="h-full px-3 text-xs font-medium">
            Against
          </SegmentedControlItem>
        </SegmentedControl>

        {!everyone && (
          <>
            <MinGamesStepper
              value={threshold}
              most={mostAny}
              onChange={setMinGames}
              unit={side === "with" ? "together" : "meetings"}
            />
            <span className="flex items-center text-xs text-muted-foreground tabular">
              {ring.length} of {all.length} shown
            </span>
          </>
        )}
      </div>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto w-full max-w-[360px] overflow-visible" aria-hidden>
        <circle cx={CENTRE} cy={CENTRE} r={RING} className="fill-none stroke-border" strokeDasharray="2 5" />
        {ring.map((entry, i) => {
          const at = seat(i);
          const lit = entry.playerId === selected?.playerId;
          return (
            <line
              key={entry.playerId}
              x1={CENTRE}
              y1={CENTRE}
              x2={at.x}
              y2={at.y}
              className={STROKE[tone(entry.ledger, measure, points, baseline)]}
              strokeWidth={1.5 + 4.5 * (entry.ledger.played / most)}
              strokeLinecap="round"
              opacity={lit ? 1 : firmness(entry.ledger, measure, most)}
            />
          );
        })}
        {ring.map((entry, i) => {
          const at = seat(i);
          const lit = entry.playerId === selected?.playerId;
          return (
            <text
              key={`name-${entry.playerId}`}
              x={at.lx}
              y={at.ly}
              textAnchor={at.cos > 0.3 ? "start" : at.cos < -0.3 ? "end" : "middle"}
              className={cn("fill-foreground text-[11px]", lit ? "font-semibold" : "opacity-80")}
            >
              {first(entry.playerId)}
            </text>
          );
        })}
        {ring.map((entry, i) => {
          const at = seat(i);
          const lit = entry.playerId === selected?.playerId;
          const mate = playerFor(entry.playerId);
          return (
            <foreignObject
              key={entry.playerId}
              x={at.x - NODE / 2 - 3}
              y={at.y - NODE / 2 - 3}
              width={NODE + 6}
              height={NODE + 6}
            >
              <button
                type="button"
                onClick={() => setPicked(entry.playerId)}
                aria-label={`${name(entry.playerId)}'s numbers`}
                aria-pressed={lit}
                className={cn(
                  "focus-ring m-[3px] block rounded-full",
                  lit && "ring-2 ring-accent ring-offset-1 ring-offset-surface-2"
                )}
              >
                <PlayerAvatar name={name(entry.playerId)} image={mate?.image} size="xs" />
              </button>
            </foreignObject>
          );
        })}
        <foreignObject x={CENTRE - 26} y={CENTRE - 26} width={52} height={52}>
          <PlayerAvatar name={player.name} image={player.image} size="md" className="ring-4 ring-accent/50" />
        </foreignObject>
      </svg>

      {selected && (
        <p className="min-h-[4.5rem] text-sm leading-relaxed" aria-live="polite">
          <span className="font-semibold">{name(selected.playerId)}</span> ·{" "}
          {selected.ledger.played} {side === "with" ? "together" : "against"} ·{" "}
          {selected.ledger.wins}W {selected.ledger.draws}D {selected.ledger.losses}L
          <br />
          {first(player.id)} took{" "}
          <span className={cn("font-semibold", TEXT[tone(selected.ledger, measure, points, baseline)])}>
            {ppg(pointsPerGame(selected.ledger, points))} pts a game
          </span>{" "}
          {side === "with" ? "with them" : "against them"}, and {ppg(baseline)} across {across}.
          {!enoughGames(selected.ledger) && <span className="opacity-70"> Too few games to say much.</span>}
        </p>
      )}
    </div>
  );
}
