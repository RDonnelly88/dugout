import { computeRatings } from "./elo";
import { recentForm } from "./form";
import { SKILL } from "./config";
import type { Match, Player } from "@/types";

interface PlayerImpact {
  playerId: string;
  /** Rating carried into the match, and the one carried out. */
  before: number;
  after: number;
  change: number;
}

export interface SideImpact {
  /** Mean rating of the side, going in and coming out. */
  ratingBefore: number;
  ratingAfter: number;
  /** Mean points a game over the recent window, before and after this result. */
  formBefore: number;
  formAfter: number;
  /**
   * Mean hand-set level. Has no before and after — it is set by a person and
   * a result never moves it.
   */
  skill: number;
  /** Biggest mover first. */
  players: PlayerImpact[];
}

export interface MatchImpact {
  A: SideImpact;
  B: SideImpact;
}

const mean = (xs: number[], fallback = 0) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : fallback;

/**
 * What a match did to the people who played in it.
 *
 * Read out of the rating history rather than recomputed, so the numbers here
 * are the ones the match was actually rated on — including for a result that
 * has since been edited, which re-rates everything after it.
 *
 * Form is worked out twice over, from the matches up to this one and from the
 * matches up to and including it, because "form" is a window over recent
 * results and there is no other way to say what it was at the time.
 */
export function matchImpact(
  matches: Match[],
  match: Match,
  players: Player[]
): MatchImpact | null {
  const point = (playerId: string): PlayerImpact | null => {
    const entry = ratings.get(playerId);
    const moment = entry?.history.find((h) => h.matchId === match.id);
    if (!moment) return null;
    return {
      playerId,
      before: moment.rating - moment.change,
      after: moment.rating,
      change: moment.change,
    };
  };

  // The clock does not matter: every figure below comes from the history,
  // which holds what the ratings were at the time, not what they have drifted
  // to since.
  const ratings = computeRatings(matches);

  const ordered = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const index = ordered.findIndex((m) => m.id === match.id);
  if (index === -1) return null;

  const formBefore = recentForm(ordered.slice(0, index));
  const formAfter = recentForm(ordered.slice(0, index + 1));

  const skillOf = new Map(
    players.map((p) => [p.id, p.skillLevel ?? SKILL.default])
  );

  const side = (playerIds: string[]): SideImpact => {
    const impacts = playerIds
      .map(point)
      .filter((p): p is PlayerImpact => p !== null)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    return {
      ratingBefore: mean(impacts.map((p) => p.before)),
      ratingAfter: mean(impacts.map((p) => p.after)),
      formBefore: mean(
        playerIds.map((id) => formBefore.get(id)?.pointsPerGame ?? 0)
      ),
      formAfter: mean(
        playerIds.map((id) => formAfter.get(id)?.pointsPerGame ?? 0)
      ),
      skill: mean(playerIds.map((id) => skillOf.get(id) ?? SKILL.default)),
      players: impacts,
    };
  };

  const a = side(match.teamA.players ?? []);
  const b = side(match.teamB.players ?? []);

  // A fixture that was never played leaves no trace in the history.
  if (a.players.length === 0 && b.players.length === 0) return null;

  return { A: a, B: b };
}
