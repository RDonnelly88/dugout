import type { Match } from "@/types";
import type { Tally } from "./head-to-head";

/**
 * Who you actually play well with.
 *
 * The hard part is not counting the games, it is refusing to be impressed by
 * three of them. "100% with Dave" off a single Tuesday is not chemistry, it is
 * a coin landing heads, and the old version of this put exactly that on the
 * front of a card. Everything here is pulled back towards the player's own
 * average by how little evidence there is.
 */

/**
 * Games of evidence needed before a result is worth half of what it claims.
 *
 * Four is deliberately blunt: one game together moves the number a fifth of the
 * way, five games move it a little over half, twenty move it most of the way.
 * Nothing about a kickabout justifies pretending to more precision.
 */
export const SHRINKAGE = 4;

/** Below this a pairing is listed but never ranked or called a favourite. */
export const MIN_GAMES = 3;

/**
 * A result as a single number: a win is one, a draw is a half, a loss nought.
 *
 * Deliberately not points. The points a win is worth belong to the league
 * table, and the SQL views own that — duplicating the scheme here would mean
 * two places to change it and one of them would get missed.
 */
export const share = (tally: Tally): number =>
  tally.played > 0 ? (tally.wins + tally.draws * 0.5) / tally.played : 0;

export interface ChemistryEntry {
  playerId: string;
  tally: Tally;
  /** What actually happened, unadjusted. */
  observed: number;
  /** Pulled towards the subject's own average by the weight of evidence. */
  adjusted: number;
  /** How far above or below the subject's own average, after adjustment. */
  lift: number;
  /** Nought to one. How much of the raw result survived the adjustment. */
  confidence: number;
}

export interface ChemistryReport {
  /** The subject's own result share across every game counted. */
  baseline: number;
  played: number;
  /** Best lift first. */
  withPlayers: ChemistryEntry[];
  /** Best lift first — a high lift here means you tend to beat them. */
  againstPlayers: ChemistryEntry[];
}

const empty = (): Tally => ({ played: 0, wins: 0, draws: 0, losses: 0 });

const add = (tally: Tally, result: "win" | "draw" | "loss") => {
  tally.played += 1;
  if (result === "win") tally.wins += 1;
  else if (result === "draw") tally.draws += 1;
  else tally.losses += 1;
};

const entry = (playerId: string, tally: Tally, baseline: number): ChemistryEntry => {
  // Standard shrinkage: with no games the estimate *is* the baseline, and it
  // approaches what was observed only as the games pile up.
  const confidence = tally.played / (tally.played + SHRINKAGE);
  const observed = share(tally);
  const adjusted = baseline + (observed - baseline) * confidence;
  return { playerId, tally, observed, adjusted, lift: adjusted - baseline, confidence };
};

/** A completed match with both scores in. Anything else tells us nothing. */
const isPlayable = (match: Match): boolean =>
  match.status === "completed" &&
  typeof match.teamA.score === "number" &&
  typeof match.teamB.score === "number";

/**
 * Every pairing the subject has, in one pass.
 *
 * Filter `matches` before calling to scope it to a season — this deliberately
 * knows nothing about seasons, so there is one code path whatever is asked.
 */
export function chemistryFor(matches: Match[], playerId: string): ChemistryReport {
  const own = empty();
  const withTally = new Map<string, Tally>();
  const againstTally = new Map<string, Tally>();

  const bump = (map: Map<string, Tally>, id: string, result: "win" | "draw" | "loss") => {
    let tally = map.get(id);
    if (!tally) {
      tally = empty();
      map.set(id, tally);
    }
    add(tally, result);
  };

  for (const match of matches) {
    if (!isPlayable(match)) continue;

    const inA = match.teamA.players.includes(playerId);
    const inB = match.teamB.players.includes(playerId);
    if (!inA && !inB) continue;

    const scoreA = match.teamA.score as number;
    const scoreB = match.teamB.score as number;
    const drawn = scoreA === scoreB;
    const won = drawn ? false : inA ? scoreA > scoreB : scoreB > scoreA;
    const result = drawn ? "draw" : won ? "win" : "loss";

    add(own, result);

    const mine = inA ? match.teamA.players : match.teamB.players;
    const theirs = inA ? match.teamB.players : match.teamA.players;

    for (const id of mine) {
      if (id !== playerId) bump(withTally, id, result);
    }
    for (const id of theirs) {
      bump(againstTally, id, result);
    }
  }

  const baseline = share(own);
  const rank = (map: Map<string, Tally>) =>
    [...map.entries()]
      .map(([id, tally]) => entry(id, tally, baseline))
      .sort((a, b) => b.lift - a.lift || b.tally.played - a.tally.played);

  return {
    baseline,
    played: own.played,
    withPlayers: rank(withTally),
    againstPlayers: rank(againstTally),
  };
}

/**
 * The best few, only where there is enough to go on.
 *
 * `worst` flips the order rather than sorting separately, so the two ends of
 * the same list can never disagree about what counts as enough evidence.
 */
export const pick = (
  entries: ChemistryEntry[],
  { count = 4, worst = false, minGames = MIN_GAMES } = {}
): ChemistryEntry[] => {
  const eligible = entries.filter((e) => e.tally.played >= minGames);
  return (worst ? [...eligible].reverse() : eligible).slice(0, count);
};
