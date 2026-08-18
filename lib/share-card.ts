import { outcomeOf } from "./match-result";
import type { Match } from "@/types";

/**
 * What a match looks like as a picture worth sending to the group.
 *
 * The wording and the ordering are worked out here rather than in the route
 * that draws it, so both are testable without rendering a PNG. The route owns
 * pixels and nothing else.
 */

export interface ShareSide {
  name: string;
  /** Absent when nobody wrote the goals down, which is most Tuesdays. */
  score?: number;
  players: string[];
  won: boolean;
}

export interface ShareCard {
  /** "Bibs win 5–3", "Bibs win it", "Honours even". */
  headline: string;
  /** How it felt, for the line the score already tells you nothing about. */
  blurb: string;
  date: string;
  location?: string;
  a: ShareSide;
  b: ShareSide;
}

/** An en dash, because a score is a range and a hyphen is not. */
const DASH = "–";

/**
 * The date as it would be said aloud rather than as it is stored.
 *
 * Fixed to en-GB: the card is one image sent to other people, so it cannot
 * take its format from whoever happens to be looking at it.
 */
function spokenDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * The picture of a played match, or null if there is nothing to boast about.
 *
 * A fixture that has not been played has no result to put on a card, and a
 * card saying "0–0, not played yet" in a WhatsApp thread is worse than no card.
 */
export function shareCard(
  match: Match,
  sideNames: { A: string; B: string },
  nameOf: (playerId: string) => string
): ShareCard | null {
  const outcome = outcomeOf(match);
  if (!outcome) return null;

  const scoreA = match.teamA.score;
  const scoreB = match.teamB.score;
  const scored = typeof scoreA === "number" && typeof scoreB === "number";

  const winner = outcome === "a" ? sideNames.A : sideNames.B;
  const high = scored ? Math.max(scoreA, scoreB) : 0;
  const low = scored ? Math.min(scoreA, scoreB) : 0;

  const headline =
    outcome === "draw"
      ? scored
        ? `Honours even, ${scoreA}${DASH}${scoreB}`
        : "Honours even"
      : scored
        ? `${winner} win ${high}${DASH}${low}`
        : `${winner} win it`;

  const margin = scored ? high - low : 0;
  const blurb =
    outcome === "draw"
      ? "Honours even"
      : !scored
        ? headline
        : margin === 1
          ? "Nothing in it"
          : margin < 4
            ? "Comfortable enough"
            : "A hammering";

  const names = (ids: string[]) => ids.map(nameOf);

  return {
    headline,
    blurb,
    date: spokenDate(match.date),
    location: match.location || undefined,
    a: {
      name: sideNames.A,
      score: scored ? scoreA : undefined,
      players: names(match.teamA.players),
      won: outcome === "a",
    },
    b: {
      name: sideNames.B,
      score: scored ? scoreB : undefined,
      players: names(match.teamB.players),
      won: outcome === "b",
    },
  };
}

/** The letters that stand in for a face, the picture having no avatars. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts.at(-1)![0]).toUpperCase();
}
