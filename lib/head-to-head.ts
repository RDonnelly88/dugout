import type { Match } from "@/types";

export interface Tally {
  played: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface HeadToHead {
  /** Matches the pair were on the same side. Wins are the pair's wins. */
  together: Tally;
  /**
   * Matches they were on opposite sides. Counted from the first player's
   * point of view, so `wins` is how often the first one came out on top.
   */
  against: Tally;
}

const empty = (): Tally => ({ played: 0, wins: 0, draws: 0, losses: 0 });

const add = (tally: Tally, result: "win" | "draw" | "loss") => {
  tally.played += 1;
  if (result === "win") tally.wins += 1;
  else if (result === "draw") tally.draws += 1;
  else tally.losses += 1;
};

/**
 * How two players get on: as teammates, and as opponents.
 *
 * The interesting question in a squad that reshuffles every week is not who is
 * best, it is who is better *with whom* — and this is the half of it the
 * league table can never show.
 *
 * A match where neither played, or only one did, counts towards neither tally.
 */
export function headToHead(
  matches: Match[],
  playerA: string,
  playerB: string
): HeadToHead {
  const together = empty();
  const against = empty();

  for (const match of matches) {
    if (
      match.status !== "completed" ||
      typeof match.teamA.score !== "number" ||
      typeof match.teamB.score !== "number"
    ) {
      continue;
    }

    const aInA = match.teamA.players.includes(playerA);
    const aInB = match.teamB.players.includes(playerA);
    const bInA = match.teamA.players.includes(playerB);
    const bInB = match.teamB.players.includes(playerB);

    const aPlayed = aInA || aInB;
    const bPlayed = bInA || bInB;
    if (!aPlayed || !bPlayed) continue;

    const scoreA = match.teamA.score;
    const scoreB = match.teamB.score;
    const drawn = scoreA === scoreB;

    // From the first player's side of the pitch.
    const aWon = drawn ? false : aInA ? scoreA > scoreB : scoreB > scoreA;
    const result = drawn ? "draw" : aWon ? "win" : "loss";

    if (aInA === bInA) {
      // Same side.
      add(together, result);
    } else {
      add(against, result);
    }
  }

  return { together, against };
}

/** Wins as a share of games played; nought games is nought, not a divide by zero. */
export const rate = (tally: Tally): number =>
  tally.played > 0 ? tally.wins / tally.played : 0;
