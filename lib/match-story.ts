import { ELO } from "./config";
import { computeRatings } from "./elo";
import { matchExpectations } from "./expected-wins";
import { milestones } from "./milestones";
import { outcomeOf, resultFor } from "./match-result";
import { ordinal } from "./podium";
import { calculatePlayerRanks } from "./ranking-utils";
import { seasonTable, type LeagueRow, type PointValues } from "./season-positions";
import type { Match } from "@/types";

/** At or under this, a side that won was the underdog worth mentioning. */
const UPSET = 0.4;
/** At or over this, a side held to a draw was the favourite worth mentioning. */
const HELD = 0.65;
/** The fewest wins in a row worth a line. */
const RUN = 3;
/** The fewest wins in a row worth a line for having been ended. */
const ENDED = 3;
/** The fewest games without a win before a win is worth a line. */
const DROUGHT = 3;
/** The fewest defeats in a row worth a line. */
const LOSING = 3;
/** The fewest games unbeaten worth a line, when they were not all wins. */
const UNBEATEN = 3;
/** The fewest places climbed worth a line. */
const CLIMB = 3;
/** The smallest margin worth calling the season's biggest win. */
const THRASHING = 3;
/** How many lines the card has room for. */
const LINES = 5;

/** "Ally", "Ally and Sam", "Ally, Sam and Chris", then "and 2 more" past three. */
function together(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length > 3) return `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`;
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/** How many of a player's games in a row, newest first, pass `test`. */
function inARow(
  games: Match[],
  playerId: string,
  test: (result: ReturnType<typeof resultFor>) => boolean
): number {
  let run = 0;
  for (const game of games) {
    if (!test(resultFor(game, playerId))) break;
    run++;
  }
  return run;
}

type Run = { id: string; n: number };

/** Everybody whose count reaches `least`, longest first, then by name. */
function onRuns(
  ids: string[],
  count: (id: string) => number,
  least: number,
  name: (id: string) => string
): Run[] {
  return ids
    .map((id) => ({ id, n: count(id) }))
    .filter((r) => r.n >= least)
    .sort((x, y) => y.n - x.n || name(x.id).localeCompare(name(y.id)));
}

/**
 * One line for everybody on the same kind of run: a single count when they
 * are all on the same one, and each player's own count when they differ.
 */
function runLine(
  runs: Run[],
  name: (id: string) => string,
  alike: (names: string, n: number, several: boolean) => string,
  label: string,
  each: (run: Run) => string = (r) => `${name(r.id)} ${r.n}`,
  /** How many to name before the rest are counted. */
  shown = 3
): string | null {
  if (runs.length === 0) return null;
  if (runs.every((r) => r.n === runs[0].n)) {
    return alike(together(runs.map((r) => name(r.id))), runs[0].n, runs.length > 1);
  }
  const rest = runs.length - shown;
  return `${label}: ${runs.slice(0, shown).map(each).join(", ")}${rest > 0 ? ` and ${rest} more` : ""}`;
}

const won = (n: number, several: boolean) => `${several ? "have" : "has"} won ${n} in a row`;
const unbeatenIn = (n: number, several: boolean) => `${several ? "are" : "is"} unbeaten in ${n}`;
const lost = (n: number, several: boolean) => `${several ? "have" : "has"} lost ${n} in a row`;

/**
 * The runs everybody is on now, over their own games, newest first: wins in
 * a row, unbeaten, without a win, and defeats in a row, each from three, one
 * line a kind. A run is counted to a player's latest game whenever that was,
 * so somebody who sat out last week is still on the run they left on; only
 * players whose latest game is among `recent` are counted, so a run from a
 * player gone since March is not news.
 */
export function currentRuns({
  played,
  players,
  recent,
  nameOf,
  shown = 3,
}: {
  played: Match[];
  players: string[];
  recent: Set<string>;
  nameOf: (playerId: string) => string | undefined;
  /** How many on each kind of run to name before the rest are counted. */
  shown?: number;
}): string[] {
  const name = (id: string) => nameOf(id) ?? "";
  const ordered = newestFirst(played.filter((m) => outcomeOf(m) !== null));
  const gamesOf = new Map(
    players
      .filter((id) => nameOf(id) !== undefined)
      .map((id) => [id, ordered.filter((game) => resultFor(game, id) !== null)] as const)
      .filter(([, games]) => games.length > 0 && recent.has(games[0].id))
  );
  const ids = [...gamesOf.keys()];
  const games = (id: string) => gamesOf.get(id) ?? [];
  const wins = (id: string) => inARow(games(id), id, (r) => r === "win");
  const losses = (id: string) => inARow(games(id), id, (r) => r === "loss");

  return [
    runLine(onRuns(ids, wins, RUN, name), name, (names, n, several) => `${names} ${won(n, several)}`, "Winning runs", undefined, shown),
    // Unbeaten and winless, but not a run of wins or defeats told twice.
    runLine(
      onRuns(ids, (id) => {
        const n = inARow(games(id), id, (r) => r === "win" || r === "draw");
        return n > wins(id) ? n : 0;
      }, UNBEATEN, name),
      name,
      (names, n, several) => `${names} ${unbeatenIn(n, several)}`,
      "Unbeaten runs",
      undefined,
      shown
    ),
    runLine(
      onRuns(ids, (id) => {
        const n = inARow(games(id), id, (r) => r === "loss" || r === "draw");
        return n > losses(id) ? n : 0;
      }, DROUGHT, name),
      name,
      (names, n, several) => `${names} ${several ? "haven't" : "hasn't"} won in ${n}`,
      "Without a win",
      undefined,
      shown
    ),
    runLine(onRuns(ids, losses, LOSING, name), name, (names, n, several) => `${names} ${lost(n, several)}`, "Losing runs", undefined, shown),
  ].filter((line): line is string => line !== null);
}

const newestFirst = (matches: Match[]) =>
  [...matches].sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());

/** Whoever is top of the ladder once `matches` are counted, among `who`. */
function leaderOf(matches: Match[], who: (playerId: string) => boolean): string | undefined {
  let best: { id: string; rating: number } | undefined;
  for (const rating of computeRatings(matches).values()) {
    if (!who(rating.playerId)) continue;
    if (!best || rating.rating > best.rating) best = { id: rating.playerId, rating: rating.rating };
  }
  return best?.id;
}

/**
 * Everything the story of a night is told from, as it stood at the final
 * whistle: the matches played by then, this one among them, the season's
 * share of them, what the first side was given going in, and the season's
 * table either side of the match, counted with what a win and a draw are
 * worth. Nothing later reaches back into it, so a night from March is told
 * as March saw it.
 *
 * `played` is empty for a match that is not in the history at all.
 */
export function nightContext(match: Match, history: Match[], values: PointValues | null) {
  const ordered = history
    .filter((m) => outcomeOf(m) !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const index = ordered.findIndex((m) => m.id === match.id);
  const played = index === -1 ? [] : ordered.slice(0, index + 1);
  const season = match.seasonId ? played.filter((m) => m.seasonId === match.seasonId) : [];

  let table: { before: LeagueRow[]; after: LeagueRow[] } | undefined;
  if (values && season.length > 0) {
    table = {
      before: seasonTable(season.filter((m) => m.id !== match.id), values),
      after: seasonTable(season, values),
    };
  }

  return {
    played,
    season,
    // Read off the history to this night, which holds everything before it:
    // later results never reach back into the odds a match was played at.
    chanceA: matchExpectations(played).get(match.id),
    table,
    league: table && {
      before: calculatePlayerRanks(table.before),
      after: calculatePlayerRanks(table.after),
    },
  };
}

/**
 * The things about a night worth saying in the group chat, most telling
 * first, as many as the card has room for.
 *
 * `played` is every match the squad had played by the end of this one, this
 * one among them, and `season` the same for the season it was part of, so
 * each line is true of the night rather than of whatever has happened since.
 * `chanceA` is what the first side was expected to take going in, from
 * nought to one, and `league` everybody's place in the season's table either
 * side of the match.
 */
export function matchStory({
  match,
  played,
  season = [],
  chanceA,
  league,
  nameOf,
  among = () => true,
  runs = true,
  worth = () => true,
  lines: room = LINES,
}: {
  match: Match;
  played: Match[];
  season?: Match[];
  chanceA?: number;
  league?: { before: Record<string, number>; after: Record<string, number> };
  /** Undefined for a player deleted since, who has no story to tell. */
  nameOf: (playerId: string) => string | undefined;
  /**
   * Who the ladder of ratings is read among: the squad as it is, so a player
   * who has stopped coming is not the No. 1 anybody is told about.
   */
  among?: (playerId: string) => boolean;
  /** Whether to tell of runs, for a page that tells of them in a place of its own. */
  runs?: boolean;
  /**
   * Which lengths of a run still going are worth telling. Every one, for a
   * single night; a season told night by night would otherwise say the same
   * run again every week as it grows.
   */
  worth?: (n: number) => boolean;
  /** How many lines there is room for. */
  lines?: number;
}): string[] {
  const outcome = outcomeOf(match);
  if (!outcome) return [];
  const lines: string[] = [];
  const known = (ids: string[]) => ids.filter((id) => nameOf(id) !== undefined);
  const name = (id: string) => nameOf(id) ?? "";
  const lineUp = known([...match.teamA.players, ...match.teamB.players]);
  const winners = known(outcome === "a" ? match.teamA.players : outcome === "b" ? match.teamB.players : []);
  const losers = known(outcome === "a" ? match.teamB.players : outcome === "b" ? match.teamA.players : []);

  // Each player's games, newest first and this one leading, so a count is
  // where they stood once the final whistle had gone.
  const ordered = newestFirst(played);
  const gamesOf = new Map(
    lineUp.map((id) => [id, ordered.filter((game) => resultFor(game, id) !== null)])
  );
  const games = (id: string) => gamesOf.get(id) ?? [];
  const before = (id: string) => games(id).slice(1);

  /** Whoever has the most of something, if the most reaches `least`. */
  const most = (ids: string[], count: (id: string) => number, least: number) => {
    const counted = ids.map((id) => ({ id, n: count(id) }));
    const top = Math.max(0, ...counted.map((c) => c.n));
    return top >= least ? { n: top, ids: counted.filter((c) => c.n === top).map((c) => c.id) } : null;
  };
  const say = (ids: string[], one: string, many: string) =>
    `${together(ids.map(name))} ${ids.length === 1 ? one : many}`;

  // A new name at the top of the league.
  if (league) {
    const top = lineUp.filter((id) => league.after[id] === 1 && league.before[id] !== 1);
    const already = Object.keys(league.after).filter(
      (id) => league.after[id] === 1 && league.before[id] === 1 && nameOf(id) !== undefined
    );
    if (top.length > 0) {
      lines.push(
        already.length > 0
          ? `${say(top, "joins", "join")} ${together(already.map(name))} at the top of the league`
          : `${say(top, "goes", "go")} top of the league`
      );
    }
  }

  // Runs, the stories the group talks about most: one line for each kind,
  // with everybody on one in it.
  if (runs) {
    const add = (line: string | null) => line && lines.push(line);
    const find = (ids: string[], count: (id: string) => number, least: number) => onRuns(ids, count, least, name);
    // For a run still going: only the lengths worth telling.
    const going = (ids: string[], count: (id: string) => number, least: number) =>
      find(ids, count, least).filter((r) => worth(r.n));
    add(runLine(going(winners, (id) => inARow(games(id), id, (r) => r === "win"), RUN), name,
      (names, n, several) => `${names} ${won(n, several)}`, "Winning runs"));
    // Unbeaten, and not just a winning run told twice.
    add(runLine(
      going(
        lineUp.filter((id) => !losers.includes(id)),
        (id) => {
          const n = inARow(games(id), id, (r) => r === "win" || r === "draw");
          return n > inARow(games(id), id, (r) => r === "win") ? n : 0;
        },
        UNBEATEN
      ),
      name,
      (names, n, several) => `${names} ${unbeatenIn(n, several)}`,
      "Unbeaten runs"
    ));
    // A win at last, after a run without one; counted to include tonight's.
    add(runLine(
      find(winners, (id) => inARow(before(id), id, (r) => r !== "win") + 1, DROUGHT + 1),
      name,
      (names, n, several) => (several ? `First wins in ${n} for ${names}` : `${names}'s first win in ${n}`),
      "First wins in a while",
      (r) => `${name(r.id)} in ${r.n}`
    ));
    add(runLine(going(losers, (id) => inARow(games(id), id, (r) => r === "loss"), LOSING), name,
      (names, n, several) => `${names} ${lost(n, several)}`, "Losing runs"));
    // The winning run a loser walked in on.
    add(runLine(
      find(losers, (id) => inARow(before(id), id, (r) => r === "win"), ENDED),
      name,
      (names, n, several) => (several ? `Runs of ${n} wins over for ${names}` : `${names}'s run of ${n} wins is over`),
      "Winning runs over",
      (r) => `${name(r.id)} at ${r.n}`
    ));
  }

  if (chanceA !== undefined) {
    const percent = (chance: number) => Math.round(chance * 100);
    if (outcome === "draw") {
      const chance = Math.max(chanceA, 1 - chanceA);
      if (chance >= HELD) lines.push(`The favourites had a ${percent(chance)}% chance and were held`);
    } else {
      const chance = outcome === "a" ? chanceA : 1 - chanceA;
      if (chance <= UPSET) lines.push(`An upset: the winners had a ${percent(chance)}% chance`);
    }
  }

  // The widest margin the season has seen, beating every one before it.
  const margin = (m: Match) =>
    typeof m.teamA.score === "number" && typeof m.teamB.score === "number"
      ? Math.abs(m.teamA.score - m.teamB.score)
      : null;
  const tonight = margin(match);
  if (outcome !== "draw" && tonight !== null && tonight >= THRASHING) {
    const earlier = season.filter(
      (m) => m.id !== match.id && new Date(m.date).getTime() <= new Date(match.date).getTime()
    );
    const widest = Math.max(0, ...earlier.map((m) => margin(m) ?? 0));
    if (earlier.length > 0 && tonight > widest) {
      lines.push(`The biggest win of the season so far, by ${tonight}`);
    }
  }

  // A new No. 1 on the ladder of ratings.
  const counted = (id: string) => among(id) || lineUp.includes(id);
  const leader = leaderOf(played, counted);
  if (
    leader !== undefined &&
    lineUp.includes(leader) &&
    leader !== leaderOf(played.filter((m) => m.id !== match.id), counted)
  ) {
    lines.push(`${name(leader)} is the new No. 1 in the ratings`);
  }

  const debuts = lineUp.filter((id) => games(id).length === 1);
  if (debuts.length > 0) {
    lines.push(
      debuts.length === 1
        ? `A first game for ${name(debuts[0])}`
        : `First games for ${together(debuts.map(name))}`
    );
  }

  const counts = lineUp.map((id) => ({
    playerId: id,
    played: games(id).length,
    wins: games(id).filter((game) => resultFor(game, id) === "win").length,
  }));
  // One line a player, so a fiftieth game and a twenty-fifth win on the
  // same night are said together.
  const reached = new Map<string, string[]>();
  for (const mark of milestones(counts, new Set(lineUp), 0)) {
    if (mark.toGo !== 0) continue;
    // A win count sitting on a mark was only brought up tonight by a win.
    if (mark.kind === "wins" && !winners.includes(mark.playerId)) continue;
    const said = `${ordinal(mark.mark)} ${mark.kind === "games" ? "game" : "win"}`;
    reached.set(mark.playerId, [...(reached.get(mark.playerId) ?? []), said]);
  }
  // And one line a milestone, so three fiftieth games on one night are one
  // line rather than three.
  const shared = new Map<string, string[]>();
  for (const [playerId, marks] of reached) {
    const said = marks.join(" and ");
    shared.set(said, [...(shared.get(said) ?? []), playerId]);
  }
  for (const [said, ids] of shared) {
    lines.push(
      ids.length === 1
        ? `${name(ids[0])}'s ${said}`
        : `${said.replace(/\b(game|win)\b/g, "$1s")} for ${together(ids.map(name))}`
    );
  }

  if (league) {
    const ranked = lineUp.filter((id) => league.before[id] !== undefined && league.after[id] !== undefined);
    const climb = most(ranked, (id) => league.before[id] - league.after[id], CLIMB);
    // One climber is a story; several level is a reshuffle.
    if (climb && climb.ids.length === 1) {
      const id = climb.ids[0];
      lines.push(`${name(id)} climbs ${climb.n} places to ${ordinal(league.after[id])}`);
    }
  }

  // The highest a settled rating has been, brought up tonight.
  const ratings = computeRatings(played);
  let peak: { id: string; rating: number } | undefined;
  for (const id of lineUp) {
    const history = ratings.get(id)?.history ?? [];
    const at = history.findIndex((point) => point.matchId === match.id);
    if (at < ELO.settledAfter) continue;
    const rating = history[at].rating;
    const highest = history.slice(0, at).every((point) => point.rating < rating);
    if (highest && (!peak || rating > peak.rating)) peak = { id, rating };
  }
  if (peak) lines.push(`A career-high rating for ${name(peak.id)}: ${Math.round(peak.rating)}`);

  return lines.slice(0, room);
}
