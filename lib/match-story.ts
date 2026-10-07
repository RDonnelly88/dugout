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
/** How many lines the card has room for. */
const LINES = 3;

/** "Ally", "Ally and Sam", "Ally, Sam and Chris", then a count past three. */
function together(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length > 3) return `${names.length} of them`;
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/** How many of a player's games in a row, newest first, they won. */
function winsInARow(games: Match[], playerId: string): number {
  let run = 0;
  for (const game of games) {
    if (resultFor(game, playerId) !== "win") break;
    run++;
  }
  return run;
}

/**
 * The few things about a night worth saying in the group chat, most telling
 * first: the side that won against the odds, a round number brought up or a
 * first game, a winning run kept going, a winning run brought to an end.
 *
 * `played` is every match the squad had played by the end of this one,
 * this one among them, so each line is true of the night rather than of
 * whatever has happened since. `chanceA` is what the first side was expected
 * to take going in, from nought to one.
 */
export function matchStory({
  match,
  played,
  chanceA,
  sides,
  nameOf,
}: {
  match: Match;
  played: Match[];
  chanceA?: number;
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

  if (chanceA !== undefined) {
    const percent = (chance: number) => Math.round(chance * 100);
    if (outcome === "draw") {
      const favourite = chanceA >= 0.5 ? "A" : "B";
      const chance = favourite === "A" ? chanceA : 1 - chanceA;
      if (chance >= HELD) lines.push(`${sides[favourite]} were ${percent(chance)}% favourites and were held`);
    } else {
      const chance = outcome === "a" ? chanceA : 1 - chanceA;
      const side = outcome === "a" ? sides.A : sides.B;
      if (chance <= UPSET) lines.push(`${side} won with a ${percent(chance)}% chance`);
    }
  }

  // Each player's games, newest first and this one leading, so a count is
  // where they stood once the final whistle had gone.
  const ordered = [...played].sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());
  const gamesOf = new Map(
    lineUp.map((id) => [id, ordered.filter((game) => resultFor(game, id) !== null)])
  );

  const debuts = lineUp.filter((id) => gamesOf.get(id)!.length === 1);
  if (debuts.length > 0) {
    lines.push(
      debuts.length === 1
        ? `A first game for ${name(debuts[0])}`
        : `First games for ${together(debuts.map(name))}`
    );
  }

  const counts = lineUp.map((id) => {
    const games = gamesOf.get(id)!;
    return {
      playerId: id,
      played: games.length,
      wins: games.filter((game) => resultFor(game, id) === "win").length,
    };
  });
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
  for (const [playerId, marks] of reached) {
    lines.push(`${name(playerId)}'s ${marks.join(" and ")}`);
  }

  const runs = winners.map((id) => ({ id, run: winsInARow(gamesOf.get(id)!, id) }));
  const longest = Math.max(0, ...runs.map((r) => r.run));
  if (longest >= RUN) {
    const on = runs.filter((r) => r.run === longest).map((r) => name(r.id));
    lines.push(`${together(on)} ${on.length === 1 ? "has" : "have"} won ${longest} in a row`);
  }

  // The run a loser walked in on: their games before this one.
  const ended = losers.map((id) => ({ id, run: winsInARow(gamesOf.get(id)!.slice(1), id) }));
  const biggest = Math.max(0, ...ended.map((r) => r.run));
  if (biggest >= ENDED) {
    const on = ended.filter((r) => r.run === biggest).map((r) => name(r.id));
    const winner = outcome === "a" ? sides.A : sides.B;
    lines.push(
      on.length === 1
        ? `${winner} ended ${on[0]}'s run of ${biggest} wins`
        : `${winner} ended a run of ${biggest} wins for ${together(on)}`
    );
  }

  return lines.slice(0, LINES);
}
