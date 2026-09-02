import { outcomeOf } from "./match-result";
import type { Match, PlayerFormResult } from "@/types";

/**
 * What a match looks like as a picture worth sending to the group.
 *
 * The wording and the ordering are worked out here rather than in the route
 * that draws it, so both are testable without rendering a PNG. The route owns
 * pixels and nothing else.
 */

export interface SharePlayer {
  name: string;
  /**
   * What the night did to their rating. Absent for anybody the ladder has no
   * entry for, which happens to a player deleted since the match was played.
   */
  change?: number;
  /** Where the night left them on the ladder, first being top. */
  rank?: number;
  /**
   * How the last few nights went, newest first and this one among them — the
   * card is the record of a game that has just been played, so a run ending
   * the week before it would be answering a question nobody asked.
   */
  form?: PlayerFormResult[];
}

export interface ShareSide {
  name: string;
  /** Absent when nobody wrote the goals down, which is most Tuesdays. */
  score?: number;
  players: SharePlayer[];
  won: boolean;
}

/** One line of a standings table on the card. */
export interface ShareRow {
  name: string;
  /** Already rounded and ready to draw: a rating, or a points total. */
  figure: number;
  /** Whether they were in this match, so the tables answer "and us?". */
  played: boolean;
}

/**
 * The tables that go under the result, and what the card is told about them.
 *
 * Both are optional. A squad with three games behind it has a ladder worth
 * nothing and a match outside any season has no standings, and half a table
 * is worse than none.
 */
export interface ShareTables {
  /** What the night did to each player, by id. */
  changes?: Map<string, number>;
  /** How each player had been going by the end of it, newest first, by id. */
  form?: Map<string, PlayerFormResult[]>;
  /**
   * The whole ladder as it stood when this match finished, strongest first.
   * The table takes the top of it and everybody's place comes from its order,
   * so the two cannot disagree about who is second.
   */
  ladder?: { playerId: string; name: string; rating: number }[];
  /** The season's league table as it stands, best first. */
  standings?: { playerId: string; name: string; points: number }[];
  /** What the season is called, for the heading over its table. */
  seasonName?: string;
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
  /** Top of the ladder that night. Empty when there is not enough to show. */
  ladder: ShareRow[];
  /** Top of the season's league table. */
  standings: ShareRow[];
  /** What to head that table with. */
  standingsTitle: string;
}

/** How many of each table the card has room for. */
const TOP = 5;

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
 * What to head the league table with.
 *
 * A season is called "Autumn 2026", and a month and a year on their own over a
 * column of numbers read as the date the table was taken rather than as the
 * season it covers. Not said twice for a squad who have already said it.
 */
function tableTitle(seasonName?: string): string {
  if (!seasonName) return "League table";
  return /^season\b/i.test(seasonName) ? seasonName : `Season ${seasonName}`;
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
  nameOf: (playerId: string) => string,
  tables: ShareTables = {}
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

  const inMatch = new Set([...match.teamA.players, ...match.teamB.players]);
  const rankOf = new Map(
    (tables.ladder ?? []).map((row, index) => [row.playerId, index + 1])
  );
  const names = (ids: string[]): SharePlayer[] =>
    ids.map((id) => ({
      name: nameOf(id),
      change: tables.changes?.get(id),
      rank: rankOf.get(id),
      form: tables.form?.get(id),
    }));

  const top = <T extends { playerId: string; name: string }>(
    rows: T[] | undefined,
    figure: (row: T) => number
  ): ShareRow[] =>
    (rows ?? []).slice(0, TOP).map((row) => ({
      name: row.name,
      figure: Math.round(figure(row)),
      played: inMatch.has(row.playerId),
    }));

  return {
    headline,
    blurb,
    date: spokenDate(match.date),
    location: match.location || undefined,
    ladder: top(tables.ladder, (row) => row.rating),
    standings: top(tables.standings, (row) => row.points),
    standingsTitle: tableTitle(tables.seasonName),
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
