"use client";

import { useMemo } from "react";
import { calibration } from "@/lib/calibration";
import { matchExpectations, type Ledger } from "@/lib/expected-wins";
import { XW } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";

const pct = (x: number) => `${Math.round(x * 100)}%`;

/** What to call the bands, by how many there are. */
const NAMES = [
  ["Every game"],
  ["The closer half", "The clearer half"],
  ["The closest third", "The middle third", "The clearest third"],
];

/** What a band's favourites amount to, in words: the verdict, said of odds. */
function verdict(ledger: Ledger): { text: string; tone: string } {
  switch (ledger.verdict) {
    case "early":
      return { text: "Too few games to say", tone: "text-muted-foreground" };
    case "luck":
      return { text: "As the odds said", tone: "text-win" };
    case "above":
      return { text: "Favourites did better: the odds were too timid", tone: "text-draw" };
    case "below":
      return { text: "Favourites did worse: the odds were too sure", tone: "text-loss" };
  }
}

/**
 * One band of odds: the share the favourites were expected to take, the
 * share they took, and how far either side of the expectation luck alone
 * could have put it. A dot inside the shaded stretch is a prediction that
 * held up.
 */
function Band({ label, ledger }: { label: string; ledger: Ledger }) {
  const expected = ledger.expected / ledger.played;
  const took = ledger.actual / ledger.played;
  const luck = ledger.luck / ledger.played;
  const said = verdict(ledger);
  const at = (x: number) => `${Math.min(Math.max(x, 0), 1) * 100}%`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground tabular">
          {ledger.played} {ledger.played === 1 ? "game" : "games"}
        </span>
      </div>
      <div className="relative h-6 rounded-md bg-surface-2" aria-hidden>
        {/* Halfway, where a game has no favourite. */}
        <span className="absolute inset-y-0 left-1/2 border-l border-dashed border-border-strong" />
        <span
          className="absolute inset-y-1 rounded-sm bg-accent/20"
          style={{ left: at(expected - luck), width: `calc(${at(expected + luck)} - ${at(expected - luck)})` }}
        />
        <span
          className="absolute inset-y-0.5 w-0.5 -translate-x-1/2 bg-muted-foreground"
          style={{ left: at(expected) }}
        />
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-foreground"
          style={{ left: at(took) }}
        />
      </div>
      <p className="text-xs text-muted-foreground tabular">
        Expected to take {pct(expected)}, took {pct(took)} ({ledger.wins}W {ledger.draws}D{" "}
        {ledger.losses}L) · <span className={cn("font-medium", said.tone)}>{said.text}</span>
      </p>
    </div>
  );
}

/**
 * Whether the odds the ratings give come true, checked against every game
 * the squad has played: the favourites grouped by how strongly they were
 * fancied, and what they were expected to take against what they did.
 *
 * A model that says 70% should see its 70% favourites win about seven in
 * ten, and this is where anybody doubting the ratings can see whether it
 * does, on their own games rather than on trust.
 */
export default function OddsCheck({ matches }: { matches: Match[] }) {
  const { all, bands } = useMemo(() => calibration(matches, matchExpectations(matches)), [matches]);
  if (all.played === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Over all {all.played} games, the side the ratings fancied was expected to take{" "}
        <span className="font-medium text-foreground tabular">{all.expected.toFixed(1)}</span>{" "}
        wins and took{" "}
        <span className="font-medium text-foreground tabular">{all.actual.toFixed(1)}</span>, a draw
        counting a half: <span className={cn("font-medium", verdict(all).tone)}>{verdict(all).text.toLowerCase()}</span>.
        Sides picked by rating are meant to be close, so most games are near a coin-flip; split
        by how clear the favourite was, here is each share of them.
      </p>

      <div className="space-y-4">
        {bands.map((band, i) => (
          <Band
            key={band.from}
            label={`${NAMES[bands.length - 1][i]}, given ${pct(band.from)} to ${pct(band.to)}`}
            ledger={band.ledger}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        The line is what the favourites were expected to take, the dot what they took, and the
        shaded stretch how far luck alone could move it. Under {XW.minGames} games a band is too
        small to say anything.
      </p>
    </div>
  );
}
