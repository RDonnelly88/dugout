import { ELO } from "./config";
import { computeRatings } from "./elo";
import { chemistryFor, pick } from "./chemistry";
import { matchExpectations, type Ledger, type Night } from "./expected-wins";
import { outcomeOf, resultFor, sideOf } from "./match-result";
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

interface WrappedPartner {
  playerId: string;
  ledger: Ledger;
}

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
  /** Their best team-mate against the odds, once it is more than a few games. */
  partner: WrappedPartner | null;
  /** Who they shared a side with most. */
  regular: { playerId: string; played: number; wins: number } | null;
  /** The opponent they did worst against, against the odds. */
  nemesis: WrappedPartner | null;
  /** Longest runs over their own games. */
  winRun: number;
  unbeatenRun: number;
  /** Longest run of the squad's nights without missing one. */
  attendanceRun: number;
}

const time = (date: string) => new Date(date).getTime();

/** The longest run of consecutive entries that pass. */
function longestRun<T>(items: T[], passes: (item: T) => boolean): number {
  let best = 0;
  let current = 0;
  for (const item of items) {
    current = passes(item) ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}

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
  const chemistry = chemistryFor(season, odds, playerId);
  const record = chemistry.own;

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
  const regular = [...together]
    .map(([id, tally]) => ({ playerId: id, ...tally }))
    .sort((a, b) => b.played - a.played || b.wins - a.wins)[0] ?? null;

  // Past the early verdict, and on the right side of nought: a best mate
  // who still fell short of the odds is not a story worth telling.
  const partner = pick(chemistry.withPlayers, { count: 1 })[0];
  const nemesis = pick(chemistry.againstPlayers, { count: 1, worst: true })[0];

  const results = record.nights.map((night) => night.result);

  return {
    playerId,
    nights: season.length,
    record,
    place,
    bestPlace,
    journey,
    rating,
    upset: upset ? { matchId: upset.matchId, date: upset.date, chance: upset.expected } : null,
    partner: partner && partner.ledger.above > 0 ? partner : null,
    regular,
    nemesis: nemesis && nemesis.ledger.above < 0 ? nemesis : null,
    winRun: longestRun(results, (r) => r === "win"),
    unbeatenRun: longestRun(results, (r) => r !== "loss"),
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
