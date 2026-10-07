import { describe, expect, it } from "vitest";
import { matchStory } from "@/lib/match-story";
import type { Match } from "@/types";

const nameOf = (id: string) => id[0].toUpperCase() + id.slice(1);

let day = 0;
/** A match a day after the last, `a` beating `b` unless told otherwise. */
function game(
  a: string[],
  b: string[],
  outcome: "a" | "b" | "draw" = "a",
  score?: [number, number]
): Match {
  day++;
  const date = new Date(Date.UTC(2026, 0, day)).toISOString().slice(0, 10);
  return {
    id: `m${day}`,
    date,
    teamA: { name: "Bibs", players: a, score: score?.[0] },
    teamB: { name: "No bibs", players: b, score: score?.[1] },
    status: "completed",
    outcome,
    createdAt: date,
    updatedAt: date,
  };
}

type Extra = Partial<Parameters<typeof matchStory>[0]>;

/** The story of the last of `played`. */
const storyOf = (played: Match[], extra: Extra = {}) =>
  matchStory({ match: played.at(-1)!, played, nameOf, ...extra });

/** Everybody here has a few games behind them, so no debuts get in the way. */
const warmUp = () => [
  game(["ally", "sam"], ["chris", "dan"], "draw"),
  game(["ally", "chris"], ["sam", "dan"], "draw"),
];

describe("matchStory", () => {
  it("says when the underdogs won, with the chance they were given", () => {
    const played = [...warmUp(), game(["ally", "sam"], ["chris", "dan"], "b")];
    expect(storyOf(played, { chanceA: 0.69 })).toContain("An upset: the winners had a 31% chance");
  });

  it("says nothing about the odds when the favourites won", () => {
    const played = [...warmUp(), game(["ally", "sam"], ["chris", "dan"], "a")];
    expect(storyOf(played, { chanceA: 0.69 }).some((line) => line.includes("chance"))).toBe(false);
  });

  it("says when the favourites were held to a draw", () => {
    const played = [...warmUp(), game(["ally", "sam"], ["chris", "dan"], "draw")];
    expect(storyOf(played, { chanceA: 0.3 })).toContain("The favourites had a 70% chance and were held");
  });

  it("marks a first game", () => {
    const played = [...warmUp(), game(["ally", "eve"], ["chris", "dan"], "draw")];
    expect(storyOf(played)).toContain("A first game for Eve");
  });

  it("marks a round number brought up tonight", () => {
    const played = Array.from({ length: 9 }, () => game(["ally"], ["sam"], "draw"));
    expect(storyOf(played).some((line) => line.includes("10th"))).toBe(false);
    played.push(game(["ally"], ["sam"], "draw"));
    expect(storyOf(played)).toContain("10th games for Ally and Sam");
  });

  /** A count already sitting on a mark was not brought up by a defeat. */
  it("only credits a round number of wins to somebody who won tonight", () => {
    const played = [
      ...Array.from({ length: 10 }, () => game(["ally"], ["sam"], "a")),
      game(["ally"], ["sam"], "b"),
    ];
    expect(storyOf(played).some((line) => line.includes("10th win"))).toBe(false);
  });

  it("says one round number for one player as theirs", () => {
    const played = [
      ...Array.from({ length: 9 }, () => game(["ally"], ["sam"], "draw")),
      game(["ally"], ["chris"], "draw"),
    ];
    expect(storyOf(played)).toContain("Ally's 10th game");
  });

  it("says two round numbers for one player in one line", () => {
    const played = Array.from({ length: 10 }, () => game(["ally"], ["sam"], "a"));
    expect(storyOf(played)).toContain("Ally's 10th game and 10th win");
  });

  it("says who has now won a few in a row", () => {
    const played = [
      ...warmUp(),
      game(["ally", "sam"], ["chris", "dan"]),
      game(["ally", "chris"], ["sam", "dan"]),
      game(["ally", "dan"], ["sam", "chris"]),
    ];
    expect(storyOf(played)).toContain("Ally has won 3 in a row");
  });

  it("names everybody on the same run", () => {
    const played = [
      ...warmUp(),
      game(["ally", "sam"], ["chris", "dan"]),
      game(["ally", "sam"], ["chris", "dan"]),
      game(["ally", "sam"], ["chris", "dan"]),
    ];
    expect(storyOf(played)).toContain("Ally and Sam have won 3 in a row");
  });

  it("says when somebody's run was brought to an end", () => {
    const played = [
      ...warmUp(),
      ...Array.from({ length: 4 }, () => game(["ally", "sam"], ["chris", "dan"])),
      game(["ally", "chris"], ["sam", "dan"], "b"),
    ];
    expect(storyOf(played)).toContain("Ally's run of 4 wins is over");
  });

  it("marks a win at last after a run without one", () => {
    const played = [
      ...Array.from({ length: 4 }, () => game(["ally"], ["sam"], "a")),
      game(["ally"], ["sam"], "b"),
    ];
    expect(storyOf(played)).toContain("Sam's first win in 5");
  });

  it("says who has lost a few in a row", () => {
    const played = Array.from({ length: 4 }, () => game(["ally"], ["sam"], "a"));
    expect(storyOf(played)).toContain("Sam has lost 4 in a row");
  });

  /** Six wins is a winning run; it is not also an unbeaten one. */
  it("says who is unbeaten, but not of a run that was all wins", () => {
    const drawn = [
      ...Array.from({ length: 3 }, () => game(["ally"], ["sam"], "draw")),
      ...Array.from({ length: 3 }, () => game(["ally"], ["sam"], "a")),
    ];
    expect(storyOf(drawn)).toContain("Ally is unbeaten in 6");

    const won = Array.from({ length: 6 }, () => game(["ally"], ["sam"], "a"));
    expect(storyOf(won).some((line) => line.includes("unbeaten"))).toBe(false);
  });

  it("says who went top of the league", () => {
    const played = [...warmUp(), game(["ally", "sam"], ["chris", "dan"])];
    const league = { before: { chris: 1, ally: 2 }, after: { ally: 1, chris: 2 } };
    expect(storyOf(played, { league })).toContain("Ally goes top of the league");
  });

  it("says who drew level at the top with whoever was already there", () => {
    const played = [...warmUp(), game(["ally", "sam"], ["chris", "dan"])];
    const league = { before: { chris: 1, ally: 2 }, after: { chris: 1, ally: 1 } };
    expect(storyOf(played, { league })).toContain("Ally joins Chris at the top of the league");
  });

  it("says who climbed the table", () => {
    const played = [...warmUp(), game(["ally", "sam"], ["chris", "dan"])];
    const league = { before: { chris: 1, ally: 6 }, after: { chris: 1, ally: 2 } };
    expect(storyOf(played, { league })).toContain("Ally climbs 4 places to 2nd");
  });

  it("marks the biggest win of the season so far", () => {
    const season = [
      game(["ally", "sam"], ["chris", "dan"], "a", [5, 3]),
      game(["ally", "chris"], ["sam", "dan"], "a", [8, 2]),
    ];
    expect(storyOf(season, { season })).toContain("The biggest win of the season so far, by 6");
  });

  it("does not call a win the season's biggest when one before it was bigger", () => {
    const season = [
      game(["ally", "sam"], ["chris", "dan"], "a", [9, 1]),
      game(["ally", "chris"], ["sam", "dan"], "a", [8, 2]),
    ];
    expect(storyOf(season, { season }).some((line) => line.includes("biggest"))).toBe(false);
  });

  it("says who has become the No. 1 in the ratings", () => {
    // Ally leads after the first; Sam, the underdog second time round, wins
    // more back than was lost.
    const played = [game(["ally"], ["sam"], "a"), game(["ally"], ["sam"], "b")];
    expect(storyOf(played)).toContain("Sam is the new No. 1 in the ratings");
    // Still top, so not new.
    played.push(game(["ally"], ["sam"], "b"));
    expect(storyOf(played).some((line) => line.includes("No. 1"))).toBe(false);
  });

  it("marks a career-high rating once the rating has settled", () => {
    const played = [
      ...Array.from({ length: 10 }, () => game(["ally"], ["sam"], "draw")),
      game(["ally"], ["sam"], "a"),
    ];
    expect(storyOf(played).some((line) => line.startsWith("A career-high rating for Ally"))).toBe(true);
  });

  it("tells no more than the card has room for", () => {
    const played = [
      ...Array.from({ length: 9 }, () => game(["ally", "sam"], ["chris", "dan"])),
      game(["ally", "sam", "eve"], ["chris", "dan"], "b"),
    ];
    expect(storyOf(played, { chanceA: 0.8 })).toHaveLength(4);
  });

  /** Deleted since: their games still count, but there is nobody to name. */
  it("leaves out anybody the squad no longer has", () => {
    const played = [...warmUp(), game(["ally", "ghost"], ["chris", "dan"], "draw")];
    const story = storyOf(played, { nameOf: (id) => (id === "ghost" ? undefined : nameOf(id)) });
    expect(story.some((line) => line.includes("Ghost") || line.includes("undefined"))).toBe(false);
  });

  it("has nothing to say about a match nobody has played", () => {
    const fixture = { ...game(["ally"], ["sam"]), status: "scheduled" as const, outcome: undefined };
    expect(matchStory({ match: fixture, played: [], nameOf })).toEqual([]);
  });
});
