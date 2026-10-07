import { outcomeOf } from "./match-result";
import { matchStory } from "./match-story";
import { calculatePlayerRanks, sortPlayersByRank } from "./ranking-utils";
import type { Match, RecentResult } from "@/types";

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
   * How far their rating moved on the night: the side's result, plus every
   * older game of theirs fading by one more match, which is why two
   * team-mates can move by different amounts. Absent for anybody the ladder
   * has no record of.
   */
  change?: number;
  /**
   * Places gained in the league on the night, negative for places lost.
   * Absent for their first game of the season, with no place to move from.
   */
  moved?: number;
  /** Where they stand in the season's league, first being top. */
  rank?: number;
  /**
   * How the last few nights went, newest first and this one among them — the
   * card is the record of a game that has just been played, so a run ending
   * the week before it would be answering a question nobody asked.
   */
  results?: RecentResult[];
}

export interface ShareSide {
  name: string;
  /** Absent when nobody wrote the goals down, which is most Tuesdays. */
  score?: number;
  players: SharePlayer[];
  won: boolean;
  /**
   * The rating points the result locked in, the same for everybody on the
   * side. Not the night's change in a rating, which also carries every older
   * game fading and so can fall on a night the side won.
   */
  points?: number;
  /**
   * The chance the ratings gave the side before kick-off, nought to one, a
   * draw counting a half: what a result is measured against for xW.
   */
  chance?: number;
}

/** One line of a standings table on the card. */
export interface ShareRow {
  name: string;
  /** Places gained on the night, negative for places lost; see `SharePlayer.moved`. */
  moved?: number;
  /** Already rounded and ready to draw: a rating, or a points total. */
  figure: number;
  /** Whether they were in this match, so the tables answer "and us?". */
  played: boolean;
  /**
   * The placing to draw against the row, which is not the same as the row's
   * position in the list: three players level on a league share a number, and
   * the fourth of them is fourth. Counting the rows off instead would have the
   * table disagree with the number beside the same player's name overhead.
   */
  place: number;
}

/**
 * The tables that go under the result, and what the card is told about them.
 *
 * Both are optional. A squad with three games behind it has a ladder worth
 * nothing and a match outside any season has no standings, and half a table
 * is worse than none.
 */
export interface ShareTables {
  /** What the result locked in for each side; see `ShareSide.points`. */
  points?: { a?: number; b?: number };
  /** How far each player's rating moved on the night, by id. */
  changes?: Map<string, number>;
  /**
   * Every match played by the end of this one, this one among them, and what
   * the first side was expected to take from it: what the story is read from.
   */
  played?: Match[];
  chanceA?: number;
  /** How each player had been going by the end of it, newest first, by id. */
  results?: Map<string, RecentResult[]>;
  /** The ladder as it stood when this match finished, strongest first. */
  ladder?: { playerId: string; name: string; rating: number }[];
  /**
   * The whole league, in any order. The card takes the top of it and reads
   * every place beside a name off it, so it has to arrive whole rather than
   * already cut to the rows that get drawn.
   *
   * Ordered and ranked here by the same rules the season page uses, rather
   * than trusted to arrive sorted: a table and a number that disagreed about
   * who is second would both be on the same picture.
   */
  standings?: StandingsRow[];
  /** The league as it stood before this match, for how far everybody moved. */
  previous?: StandingsRow[];
  /** The season's matches by the end of this one, for the story. */
  season?: Match[];
  /**
   * The squad as it is now, by id. The ratings table and the story's No. 1
   * are read among them and whoever played on the night, so a player who has
   * stopped coming does not sit in the top five; without it, everybody.
   */
  active?: Set<string>;
  /** What the season is called, for the heading over its table. */
  seasonName?: string;
}

interface StandingsRow {
  playerId: string;
  name: string;
  points: number;
  played: number;
  wins: number;
}

export interface ShareCard {
  /** "Bibs win 5–3", "Bibs win it", "Honours even". */
  headline: string;
  /** How it felt, for the line the score already tells you nothing about. */
  blurb: string;
  /** The few things about the night worth saying; see `matchStory`. */
  story: string[];
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
export function spokenDate(iso: string): string {
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
export function tableTitle(seasonName?: string): string {
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
  /** Undefined for a player deleted since, who is drawn as "Unknown". */
  nameOf: (playerId: string) => string | undefined,
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
  // Off the league rather than the ladder, so the number beside a name and the
  // table under it are answers to the same question. The table shows the top
  // five; this is how somebody sixth finds themselves.
  const league = sortPlayersByRank(tables.standings ?? []);
  const rankOf = calculatePlayerRanks(tables.standings ?? []);
  const rankBefore = calculatePlayerRanks(tables.previous ?? []);
  const moved = (id: string) =>
    rankOf[id] !== undefined && rankBefore[id] !== undefined ? rankBefore[id] - rankOf[id] : undefined;
  const names = (ids: string[]): SharePlayer[] =>
    ids.map((id) => ({
      // Deleted since, but they still had a shirt on the night, so they keep
      // a place on the card without a name.
      name: nameOf(id) ?? "Unknown",
      change: tables.changes?.get(id),
      rank: rankOf[id],
      moved: tables.previous ? moved(id) : undefined,
      results: tables.results?.get(id),
    }));

  const top = <T extends { playerId: string; name: string }>(
    rows: T[] | undefined,
    figure: (row: T) => number,
    place: (row: T, index: number) => number,
    shift?: (row: T) => number | undefined
  ): ShareRow[] =>
    (rows ?? []).slice(0, TOP).map((row, index) => ({
      name: row.name,
      figure: Math.round(figure(row)),
      played: inMatch.has(row.playerId),
      place: place(row, index),
      ...(shift?.(row) !== undefined ? { moved: shift(row) } : {}),
    }));

  return {
    headline,
    blurb,
    story: matchStory({
      match,
      played: tables.played ?? [],
      season: tables.season,
      chanceA: tables.chanceA,
      league: tables.previous && tables.standings ? { before: rankBefore, after: rankOf } : undefined,
      among: tables.active ? (id) => tables.active!.has(id) : undefined,
      nameOf,
    }),
    date: spokenDate(match.date),
    location: match.location || undefined,
    // Ratings are a measurement rather than a count, so two of them being
    // equal to the point of sharing a place does not happen; the row number is
    // the placing. A league is a count, and ties are its normal weather.
    ladder: top(
      tables.ladder?.filter(
        (row) => !tables.active || tables.active.has(row.playerId) || inMatch.has(row.playerId)
      ),
      (row) => row.rating,
      (_row, index) => index + 1
    ),
    standings: top(
      league,
      (row) => row.points,
      (row) => rankOf[row.playerId],
      tables.previous ? (row) => moved(row.playerId) : undefined
    ),
    standingsTitle: tableTitle(tables.seasonName),
    a: {
      name: sideNames.A,
      score: scored ? scoreA : undefined,
      players: names(match.teamA.players),
      won: outcome === "a",
      points: tables.points?.a,
      chance: tables.chanceA,
    },
    b: {
      name: sideNames.B,
      score: scored ? scoreB : undefined,
      players: names(match.teamB.players),
      won: outcome === "b",
      points: tables.points?.b,
      chance: tables.chanceA === undefined ? undefined : 1 - tables.chanceA,
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
