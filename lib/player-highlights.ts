import { chemistryFor, type ChemistryEntry } from "./chemistry";
import { enoughGames, pointsPerGame } from "./measure";
import type { Ledger, Night } from "./expected-wins";
import { outcomeOf, resultFor, sideOf } from "./match-result";
import type { PointValues } from "./season-positions";
import type { Match } from "@/types";

/**
 * The parts of a player's story that hold for any stretch of games — a season
 * or their whole time with the squad: who they did best beside, who they
 * struggled against, their best runs and the win nobody saw coming.
 *
 * One reading for the player page and a season wrapped alike, so the two
 * cannot name a different best partner for the same games.
 */
export interface Highlights {
  /** Their own games, against the odds — which also carries W/D/L. */
  record: Ledger;
  /** Everybody they shared a side with, and everybody they faced. */
  mates: ChemistryEntry[];
  opponents: ChemistryEntry[];
  /**
   * Their best team-mate on the record: most points a game together, over
   * enough games to mean something.
   */
  partner: ChemistryEntry | null;
  /**
   * The opponent they took fewest points a game against, over enough games,
   * and fewer than they took overall — somebody they merely did averagely
   * against is nobody's nemesis.
   */
  nemesis: ChemistryEntry | null;
  /** Who they shared a side with most. */
  regular: { playerId: string; played: number; wins: number } | null;
  /** The win the ratings least expected. */
  upset: { matchId: string; date: string; chance: number } | null;
  /** Longest runs over their own games. */
  winRun: number;
  unbeatenRun: number;
}

/** The longest run of consecutive entries that pass. */
export function longestRun<T>(items: T[], passes: (item: T) => boolean): number {
  let best = 0;
  let current = 0;
  for (const item of items) {
    current = passes(item) ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}

/**
 * `playerId`'s highlights over `stretch`, or null if they played none of it.
 *
 * `odds` is the chance each side was given, from the whole history (see
 * `matchExpectations`). `values` is what a win and a draw are worth; without
 * them there is no record to rank partners by, so neither is named.
 */
export function highlightsFor(
  stretch: Match[],
  odds: Map<string, number>,
  playerId: string,
  values: PointValues | null
): Highlights | null {
  const theirs = stretch.filter((m) => outcomeOf(m) !== null && sideOf(m, playerId) !== null);
  if (theirs.length === 0) return null;

  const chemistry = chemistryFor(stretch, odds, playerId);
  const record = chemistry.own;

  // Only a win they were not favourites for is an upset.
  const upset = record.nights
    .filter((night) => night.result === "win" && night.expected < 0.5)
    .reduce<Night | null>((best, night) => (!best || night.expected < best.expected ? night : best), null);

  const together = new Map<string, { played: number; wins: number }>();
  for (const match of theirs) {
    const side = sideOf(match, playerId)!;
    const won = resultFor(match, playerId) === "win";
    for (const mate of side === "a" ? match.teamA.players : match.teamB.players) {
      if (mate === playerId) continue;
      const tally = together.get(mate) ?? { played: 0, wins: 0 };
      tally.played += 1;
      if (won) tally.wins += 1;
      together.set(mate, tally);
    }
  }
  const regular =
    [...together]
      .map(([id, tally]) => ({ playerId: id, ...tally }))
      .sort((a, b) => b.played - a.played || b.wins - a.wins)[0] ?? null;

  // On the record, not the odds: "what was my record with him" is the
  // question this answers. Points a game need the table's values.
  const byRecord = (entries: ChemistryEntry[]) =>
    values
      ? entries
          .filter((e) => enoughGames(e.ledger))
          .map((e) => ({ entry: e, ppg: pointsPerGame(e.ledger, values) }))
          .sort((x, y) => y.ppg - x.ppg || y.entry.ledger.played - x.entry.ledger.played)
      : [];
  const own = values ? pointsPerGame(record, values) : 0;
  const partner = byRecord(chemistry.withPlayers)[0]?.entry ?? null;
  const worst = byRecord(chemistry.againstPlayers).at(-1);
  const nemesis = worst && worst.ppg < own ? worst.entry : null;

  const results = record.nights.map((night) => night.result);

  return {
    record,
    mates: chemistry.withPlayers,
    opponents: chemistry.againstPlayers,
    partner,
    nemesis,
    regular,
    upset: upset ? { matchId: upset.matchId, date: upset.date, chance: upset.expected } : null,
    winRun: longestRun(results, (r) => r === "win"),
    unbeatenRun: longestRun(results, (r) => r !== "loss"),
  };
}
