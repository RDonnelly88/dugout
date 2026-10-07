import { ELO } from "./config";
import { computeRatings } from "./elo";
import { milestones } from "./milestones";
import { outcomeOf, resultFor } from "./match-result";
import { ordinal } from "./podium";
import type { Match } from "@/types";

/** At or under this, a side that won was the underdog worth mentioning. */
const UPSET = 0.4;
/** At or over this, a side held to a draw was the favourite worth mentioning. */
const HELD = 0.65;
/** The fewest wins in a row worth a line. */
const RUN = 3;
/** The fewest wins in a row worth a line for having been ended. */
const ENDED = 4;
/** The fewest games without a win before a win is worth a line. */
const DROUGHT = 4;
/** The fewest defeats in a row worth a line. */
const LOSING = 4;
/** The fewest games unbeaten worth a line, when they were not all wins. */
const UNBEATEN = 6;
/** The fewest places climbed worth a line. */
const CLIMB = 3;
/** The smallest margin worth calling the season's biggest win. */
const THRASHING = 3;
/** How many lines the card has room for. */
const LINES = 4;

/** "Ally", "Ally and Sam", "Ally, Sam and Chris", then a count past three. */
function together(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length > 3) return `${names.length} of them`;
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

const newestFirst = (matches: Match[]) =>
  [...matches].sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());

/** Whoever is top of the ladder once `matches` are counted. */
function leaderOf(matches: Match[]): string | undefined {
  let best: { id: string; rating: number } | undefined;
  for (const rating of computeRatings(matches).values()) {
    if (!best || rating.rating > best.rating) best = { id: rating.playerId, rating: rating.rating };
  }
  return best?.id;
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
  sides,
  nameOf,
}: {
  match: Match;
  played: Match[];
  season?: Match[];
  chanceA?: number;
  league?: { before: Record<string, number>; after: Record<string, number> };
  sides: { A: string; B: string };
  /** Undefined for a player deleted since, who has no story to tell. */
  nameOf: (playerId: string) => string | undefined;
}): string[] {
  const outcome = outcomeOf(match);
  if (!outcome) return [];
  const lines: string[] = [];
  const known = (ids: string[]) => ids.filter((id) => nameOf(id) !== undefined);
  const name = (id: string) => nameOf(id) ?? "";
  const lineUp = known([...match.teamA.players, ...match.teamB.players]);
  const winners = known(outcome === "a" ? match.teamA.players : outcome === "b" ? match.teamB.players : []);
  const losers = known(outcome === "a" ? match.teamB.players : outcome === "b" ? match.teamA.players : []);
  const winningSide = outcome === "a" ? sides.A : sides.B;

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

  if (chanceA !== undefined) {
    const percent = (chance: number) => Math.round(chance * 100);
    if (outcome === "draw") {
      const favourite = chanceA >= 0.5 ? "A" : "B";
      const chance = favourite === "A" ? chanceA : 1 - chanceA;
      if (chance >= HELD) lines.push(`${sides[favourite]} were ${percent(chance)}% favourites and were held`);
    } else {
      const chance = outcome === "a" ? chanceA : 1 - chanceA;
      if (chance <= UPSET) lines.push(`${winningSide} won with a ${percent(chance)}% chance`);
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
      lines.push(`The biggest win of the season: ${tonight} goals in it`);
    }
  }

  // A new No. 1 on the ladder of ratings.
  const leader = leaderOf(played);
  if (
    leader !== undefined &&
    lineUp.includes(leader) &&
    leader !== leaderOf(played.filter((m) => m.id !== match.id))
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

  // A win at last, after a run without one.
  const drought = most(winners, (id) => inARow(before(id), id, (r) => r !== "win"), DROUGHT);
  if (drought) {
    lines.push(
      drought.ids.length === 1
        ? `${name(drought.ids[0])}'s first win in ${drought.n + 1}`
        : `A first win in ${drought.n + 1} for ${together(drought.ids.map(name))}`
    );
  }

  const run = most(winners, (id) => inARow(games(id), id, (r) => r === "win"), RUN);
  if (run) lines.push(say(run.ids, `has won ${run.n} in a row`, `have won ${run.n} in a row`));

  // The run a loser walked in on.
  const ended = most(losers, (id) => inARow(before(id), id, (r) => r === "win"), ENDED);
  if (ended) {
    lines.push(
      ended.ids.length === 1
        ? `${winningSide} ended ${name(ended.ids[0])}'s run of ${ended.n} wins`
        : `${winningSide} ended a run of ${ended.n} wins for ${together(ended.ids.map(name))}`
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

  // Unbeaten for a while, and not just a winning run told twice.
  const unbeaten = most(
    lineUp.filter((id) => !losers.includes(id)),
    (id) => {
      const n = inARow(games(id), id, (r) => r === "win" || r === "draw");
      return n > inARow(games(id), id, (r) => r === "win") ? n : 0;
    },
    UNBEATEN
  );
  if (unbeaten) lines.push(say(unbeaten.ids, `is unbeaten in ${unbeaten.n}`, `are unbeaten in ${unbeaten.n}`));

  const losing = most(losers, (id) => inARow(games(id), id, (r) => r === "loss"), LOSING);
  if (losing) lines.push(say(losing.ids, `has lost ${losing.n} in a row`, `have lost ${losing.n} in a row`));

  return lines.slice(0, LINES);
}
