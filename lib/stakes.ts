import { ELO } from "./config";
import { expectedScore, gameWeight, type PlayerRating } from "./elo";
import type { Result } from "./recent-results";

export interface PlayerStake {
  playerId: string;
  side: "a" | "b";
  /** Where they stand going in. */
  rating: number;
  /**
   * How far each result would move them, all in: what the result is worth
   * to their side, plus every older game of theirs fading by one more match.
   * The fading is why team-mates on the same side stand to move by
   * different amounts.
   */
  change: Record<Result, number>;
}

export interface MatchStakes {
  /** The chance the first side is given, nought to one, a draw counting a half. */
  chanceA: number;
  /** Each side's average rating going in. */
  ratingA: number;
  ratingB: number;
  /** In line-up order, the first side first. */
  players: PlayerStake[];
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

const TOOK: Record<Result, number> = { win: 1, draw: 0.5, loss: 0 };

/**
 * What a match about to be played stands to do to everybody in it, worked out
 * the way the ratings will work it out once the result is in: the sides
 * averaged from where everybody stands now, the odds from the averages, and
 * each result worth `ELO.k` times what it beats or falls short of them by.
 *
 * Every older game shrinks by the same share each match, so before a ball is
 * kicked a rating eases that share of the way back to `ELO.start` whatever
 * happens; the result then goes on at full weight. Somebody with no games
 * starts there and has nothing to ease.
 *
 * Null until both sides have somebody in them.
 */
export function matchStakes(
  ratings: Map<string, PlayerRating>,
  teamA: string[],
  teamB: string[]
): MatchStakes | null {
  if (teamA.length === 0 || teamB.length === 0) return null;

  const now = (id: string) => ratings.get(id)?.rating ?? ELO.start;
  const ratingA = mean(teamA.map(now));
  const ratingB = mean(teamB.map(now));
  const chanceA = expectedScore(ratingA, ratingB);
  const keep = gameWeight(1);

  const stake = (playerId: string, side: "a" | "b"): PlayerStake => {
    const rating = now(playerId);
    const fade = (rating - ELO.start) * (keep - 1);
    const chance = side === "a" ? chanceA : 1 - chanceA;
    const moves = (result: Result) => fade + ELO.k * (TOOK[result] - chance);
    return {
      playerId,
      side,
      rating,
      change: { win: moves("win"), draw: moves("draw"), loss: moves("loss") },
    };
  };

  return {
    chanceA,
    ratingA,
    ratingB,
    players: [...teamA.map((id) => stake(id, "a")), ...teamB.map((id) => stake(id, "b"))],
  };
}
