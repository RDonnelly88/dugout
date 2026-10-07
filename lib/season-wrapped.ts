import { ELO } from "./config";
import { computeRatings } from "./elo";
import { matchExpectations, type Ledger } from "./expected-wins";
import { highlightsFor, longestRun } from "./player-highlights";
import type { ChemistryEntry } from "./chemistry";
import { outcomeOf, sideOf } from "./match-result";
import { ratingSeries } from "./rating-series";
import { seasonPositions, type PointValues } from "./season-positions";
import type { Match } from "@/types";

/**
 * One player's season, told as a story.
 *
 * Nothing in it is stored or decided: every figure is read off the matches by
 * the same pieces the rest of the app uses — the place from the table's own
 * rules, the rating from the one model run over the whole history, the odds
 * from that model before each kick-off. So the story agrees with every page
 * it points at, and correcting a result from March rewrites it.
 */

/** Somebody they played with or against, and how the games went. */
export type WrappedPartner = ChemistryEntry;

export interface Wrapped {
  playerId: string;
  /** Nights the squad played in the season. */
  nights: number;
  /** Their own games, against the odds — which also carries W/D/L. */
  record: Ledger;
  /** Where they stand after the season's last night. */
  place: { position: number; of: number } | null;
  /** The highest they reached, and after which night of the season. */
  bestPlace: { position: number; night: number; date: string } | null;
  /** Where they sat after each night, null before their first. */
  journey: (number | null)[];
  rating: {
    /** Carried into the season's first night. */
    from: number;
    /** Where the season left it. */
    to: number;
    peak: { rating: number; date: string };
  } | null;
  /** The win the ratings least expected. */
  upset: { matchId: string; date: string; chance: number } | null;
  /**
   * Their best team-mate on the record: most points a game together, over
   * enough games to mean something.
   */
  partner: WrappedPartner | null;
  /** Who they shared a side with most. */
  regular: { playerId: string; played: number; wins: number } | null;
  /**
   * The opponent they took fewest points a game against, over enough games,
   * and fewer than they took across the season — somebody they merely did
   * averagely against is nobody's nemesis.
   */
  nemesis: WrappedPartner | null;
  /**
   * Everybody they shared a side with, and everybody they faced, over the
   * season alone — the web of their season.
   */
  mates: WrappedPartner[];
  opponents: WrappedPartner[];
  /** Longest runs over their own games. */
  winRun: number;
  unbeatenRun: number;
  /** Longest run of the squad's nights without missing one. */
  attendanceRun: number;
}

const time = (date: string) => new Date(date).getTime();

/**
 * The story of `playerId`'s season, or null if they did not play in it.
 *
 * `matches` is every match the squad has: the ratings and the odds need the
 * whole history, since a season starts where the last one left everybody.
 * `values` is what a win and a draw are worth, read off the season's table by
 * `pointValues`; without it there is no table and so no place.
 */
export function seasonWrapped(
  matches: Match[],
  seasonId: string,
  playerId: string,
  values: PointValues | null
): Wrapped | null {
  const season = matches
    .filter((m) => m.seasonId === seasonId && outcomeOf(m) !== null)
    .sort((a, b) => time(a.date) - time(b.date));
  const theirs = season.filter((m) => sideOf(m, playerId) !== null);
  if (theirs.length === 0) return null;

  const odds = matchExpectations(matches);
  const story = highlightsFor(season, odds, playerId, values)!;

  // The table, night by night. Positions come from the same rules as the
  // table on the season's page, so the last one is the place shown there.
  let place: Wrapped["place"] = null;
  let bestPlace: Wrapped["bestPlace"] = null;
  let journey: (number | null)[] = [];
  if (values) {
    const { matches: steps, lines } = seasonPositions(season, values);
    journey = lines.find((line) => line.playerId === playerId)?.positions ?? [];
    const last = journey.at(-1);
    if (typeof last === "number") place = { position: last, of: lines.length };
    journey.forEach((position, night) => {
      // Ties go to the earliest night: getting there first is the story.
      if (position !== null && (!bestPlace || position < bestPlace.position)) {
        bestPlace = { position, night: night + 1, date: steps[night].date };
      }
    });
  }

  const rating = (() => {
    const line = computeRatings(matches).get(playerId);
    if (!line) return null;
    const series = ratingSeries(line);
    const start = time(season[0].date);
    const end = time(season.at(-1)!.date);
    const before = series.filter((point) => time(point.date) < start).at(-1);
    const during = series.filter(
      (point) => time(point.date) >= start && time(point.date) <= end
    );
    if (during.length === 0) return null;
    const peak = during.reduce((best, point) => (point.rating > best.rating ? point : best));
    return {
      from: before?.rating ?? ELO.start,
      to: during.at(-1)!.rating,
      peak: { rating: peak.rating, date: peak.date },
    };
  })();

  return {
    playerId,
    nights: season.length,
    record: story.record,
    place,
    bestPlace,
    journey,
    rating,
    upset: story.upset,
    partner: story.partner,
    regular: story.regular,
    nemesis: story.nemesis,
    mates: story.mates,
    opponents: story.opponents,
    winRun: story.winRun,
    unbeatenRun: story.unbeatenRun,
    attendanceRun: longestRun(season, (m) => sideOf(m, playerId) !== null),
  };
}

/** Who played in a season, for choosing whose story to read. */
export function seasonPlayers(matches: Match[], seasonId: string): string[] {
  const ids = new Set<string>();
  for (const match of matches) {
    if (match.seasonId !== seasonId || outcomeOf(match) === null) continue;
    for (const id of [...match.teamA.players, ...match.teamB.players]) ids.add(id);
  }
  return [...ids];
}
