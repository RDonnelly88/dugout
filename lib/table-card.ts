import { ELO } from "./config";
import { computeRatings } from "./elo";
import { ordinal } from "./podium";
import { calculatePlayerRanks, sortPlayersByRank } from "./ranking-utils";
import { spokenDate, tableTitle } from "./share-card";
import type { LeagueRow } from "./season-positions";
import type { Match } from "@/types";

/**
 * The tables after a night, as a picture worth sending to the group: the
 * whole ratings ladder and the season's league, each with how far everybody
 * moved on the night, and the few movements worth a sentence.
 *
 * The match card answers "how did it go?"; this one answers "so where does
 * that leave everybody?", for the whole squad rather than the ten who
 * played. Worked out here so the wording and the ordering are testable
 * without drawing a PNG.
 */

export interface TableCardRow {
  name: string;
  /** The placing, ties sharing one in a league. */
  place: number;
  /** Places gained on the night, negative for lost; absent with no place to move from. */
  moved?: number;
  /** A rating or a points total, already rounded. */
  figure: number;
  /** How far the figure moved on the night, already rounded. */
  change?: number;
  /** Whether they played on the night, so the rows that moved by playing stand out. */
  played: boolean;
}

export interface TableCard {
  date: string;
  location?: string;
  /** The movements worth a sentence, most telling first. */
  movers: string[];
  ratings: TableCardRow[];
  league?: { title: string; rows: TableCardRow[] };
}

/** As many rows as the card has room for. */
const TABLE_CARD_ROWS = 20;

interface Ranked {
  playerId: string;
  place: number;
  moved?: number;
}

/**
 * The biggest climber or faller among `rows`, by places and then by figure
 * moved. Somebody who played first: a place gained sitting at home, by
 * others dropping below, is true but not what the night was about.
 */
export function mover<T extends Ranked & { change?: number }>(
  rows: T[],
  direction: 1 | -1,
  played: (playerId: string) => boolean
): T | undefined {
  const moved = rows
    .filter((row) => (row.moved ?? 0) * direction > 0)
    .sort(
      (a, b) =>
        (b.moved! - a.moved!) * direction ||
        Math.abs(b.change ?? 0) - Math.abs(a.change ?? 0)
    );
  return moved.find((row) => played(row.playerId)) ?? moved[0];
}

/**
 * The tables as they stood after `match`.
 *
 * `played` is every match played by the end of it, this one among them, so
 * the card for a night in March shows March's tables. `league` is the
 * season's table either side of the match, absent for a match outside a
 * season. Only `active` players and whoever played on the night are listed,
 * placed among themselves, so a guest from two years ago does not hold a
 * place; without it, everybody.
 *
 * Null for a match that is not in `played`, which has moved nothing.
 */
export function tableCard({
  match,
  played,
  nameOf,
  active,
  league,
  seasonName,
}: {
  match: Match;
  played: Match[];
  nameOf: (playerId: string) => string | undefined;
  active?: Set<string>;
  league?: { before: LeagueRow[]; after: LeagueRow[] };
  seasonName?: string;
}): TableCard | null {
  if (!played.some((m) => m.id === match.id)) return null;

  const inMatch = new Set([...match.teamA.players, ...match.teamB.players]);
  const listed = (id: string) => inMatch.has(id) || !active || active.has(id);
  const name = (id: string) => nameOf(id) ?? "Unknown";

  // The ladder either side of the night, among the same people, so a place
  // moved is a place among the rows on the card.
  const after = [...computeRatings(played).values()]
    .filter((r) => listed(r.playerId))
    .sort((a, b) => b.rating - a.rating);
  const beforeRatings = computeRatings(played.filter((m) => m.id !== match.id));
  const beforePlace = new Map(
    [...beforeRatings.values()]
      .filter((r) => listed(r.playerId))
      .sort((a, b) => b.rating - a.rating)
      .map((r, i) => [r.playerId, i + 1])
  );

  const ladder = after.map((r, i) => {
    const was = beforePlace.get(r.playerId);
    return {
      playerId: r.playerId,
      place: i + 1,
      moved: was === undefined ? undefined : was - (i + 1),
      rating: r.rating,
      change: r.rating - (beforeRatings.get(r.playerId)?.rating ?? ELO.start),
    };
  });

  // Who went top first, then the league's climb ahead of the ratings':
  // points are what the squad counts each other by.
  const tops: string[] = [];
  const climbs: string[] = [];
  const top = ladder[0];
  if (top && beforePlace.get(top.playerId) !== 1) {
    tops.push(`${name(top.playerId)} goes top of the ratings`);
  }
  const up = mover(ladder, 1, (id) => inMatch.has(id));
  if (up && up !== top) {
    climbs.push(`${name(up.playerId)} climbs ${up.moved} to ${ordinal(up.place)} in the ratings`);
  }
  const down = mover(ladder, -1, (id) => inMatch.has(id));
  if (down) {
    climbs.push(`${name(down.playerId)} drops ${-down.moved!} to ${ordinal(down.place)} in the ratings`);
  }

  let leagueCard: TableCard["league"];
  if (league) {
    const rowsAfter = league.after.filter((r) => listed(r.playerId));
    const rowsBefore = league.before.filter((r) => listed(r.playerId));
    const rank = calculatePlayerRanks(rowsAfter);
    const rankBefore = calculatePlayerRanks(rowsBefore);
    const pointsBefore = new Map(rowsBefore.map((r) => [r.playerId, r.points]));
    const rows = sortPlayersByRank(rowsAfter).map((r) => ({
      playerId: r.playerId,
      place: rank[r.playerId],
      moved: rankBefore[r.playerId] === undefined ? undefined : rankBefore[r.playerId] - rank[r.playerId],
      points: r.points,
      change: inMatch.has(r.playerId) ? r.points - (pointsBefore.get(r.playerId) ?? 0) : undefined,
    }));
    const title = tableTitle(seasonName);

    const leader = rows[0];
    // Only a leader on their own: two level at the top have not gone top.
    if (leader && rows[1]?.place !== 1 && rankBefore[leader.playerId] !== 1) {
      tops.unshift(`${name(leader.playerId)} goes top of the ${title === "League table" ? "league" : title}`);
    }
    const climber = mover(rows, 1, (id) => inMatch.has(id));
    if (climber && climber !== leader) {
      climbs.unshift(`${name(climber.playerId)} climbs ${climber.moved} to ${ordinal(climber.place)} in the league`);
    }

    leagueCard = {
      title,
      rows: rows.slice(0, TABLE_CARD_ROWS).map((r) => ({
        name: name(r.playerId),
        place: r.place,
        moved: r.moved,
        figure: r.points,
        change: r.change,
        played: inMatch.has(r.playerId),
      })),
    };
  }

  return {
    date: spokenDate(match.date),
    location: match.location || undefined,
    movers: [...tops, ...climbs].slice(0, 3),
    ratings: ladder.slice(0, TABLE_CARD_ROWS).map((r) => ({
      name: name(r.playerId),
      place: r.place,
      moved: r.moved,
      figure: Math.round(r.rating),
      change: Math.round(r.change),
      played: inMatch.has(r.playerId),
    })),
    league: leagueCard,
  };
}
