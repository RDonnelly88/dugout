import { outcomeOf, type Outcome } from "./match-result";
import type { Match } from "@/types";

export interface StoryNight {
  matchId: string;
  date: string;
  /** What the night was, in the order it happened. One night can be several. */
  labels: string[];
  outcome: Outcome;
  /** Only when both were written down. */
  score?: [number, number];
  /** What was worth saying about the night; see `matchStory`. */
  story: string[];
}

/**
 * The nights a season's story is told through, oldest first: how it opened,
 * the result nobody saw coming, how it ended — or where it has got to, for a
 * season still running — and every night between with something worth
 * saying about it, a run or a milestone or a new name at the top.
 *
 * A night that is two of those at once is told once, carrying both names,
 * rather than appearing twice on the line. A season of one match is one
 * night that opened and closed it.
 */
export function seasonNights(
  season: Match[],
  {
    upsetMatchId,
    finished,
    stories = new Map(),
  }: {
    upsetMatchId?: string;
    finished: boolean;
    /** Each night's story by match id, for the nights between. */
    stories?: Map<string, string[]>;
  }
): StoryNight[] {
  const played = season
    .filter((m) => outcomeOf(m) !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (played.length === 0) return [];

  const picked = new Map<string, string[]>();
  const add = (match: Match | undefined, label: string) => {
    if (!match) return;
    picked.set(match.id, [...(picked.get(match.id) ?? []), label]);
  };

  add(played[0], "Opening night");
  add(
    played.find((m) => m.id === upsetMatchId),
    "Result of the season"
  );
  add(played.at(-1), finished ? "Final night" : "Latest night");

  return played
    .filter((m) => picked.has(m.id) || (stories.get(m.id)?.length ?? 0) > 0)
    .map((m) => {
      const a = m.teamA?.score;
      const b = m.teamB?.score;
      return {
        matchId: m.id,
        date: m.date,
        labels: picked.get(m.id) ?? [],
        story: stories.get(m.id) ?? [],
        outcome: outcomeOf(m)!,
        score: typeof a === "number" && typeof b === "number" ? [a, b] : undefined,
      };
    });
}
