import { describe, expect, it } from "vitest";
import { matchStory } from "@/lib/match-story";
import type { Match } from "@/types";

const sides = { A: "Bibs", B: "No bibs" };
const nameOf = (id: string) => id[0].toUpperCase() + id.slice(1);

let day = 0;
/** A match a day after the last, `a` beating `b` unless told otherwise. */
function game(a: string[], b: string[], outcome: "a" | "b" | "draw" = "a"): Match {
  day++;
  const date = new Date(Date.UTC(2026, 0, day)).toISOString().slice(0, 10);
  return {
    id: `m${day}`,
    date,
    teamA: { name: "Bibs", players: a },
    teamB: { name: "No bibs", players: b },
    status: "completed",
    outcome,
    createdAt: date,
    updatedAt: date,
  };
}

/** The story of the last of `played`. */
const storyOf = (played: Match[], chanceA?: number) =>
  matchStory({ match: played.at(-1)!, played, chanceA, sides, nameOf });

/** Everybody here has a few games behind them, so no debuts get in the way. */
const warmUp = () => [
  game(["ally", "sam"], ["chris", "dan"], "draw"),
  game(["ally", "chris"], ["sam", "dan"], "draw"),
];

describe("matchStory", () => {
  it("says when the underdogs won, with the chance they were given", () => {
    const played = [...warmUp(), game(["ally", "sam"], ["chris", "dan"], "b")];
    expect(storyOf(played, 0.69)).toContain("No bibs won with a 31% chance");
  });

  it("says nothing about the odds when the favourites won", () => {
    const played = [...warmUp(), game(["ally", "sam"], ["chris", "dan"], "a")];
    expect(storyOf(played, 0.69)).toEqual([]);
  });

  it("says when the favourites were held to a draw", () => {
    const played = [...warmUp(), game(["ally", "sam"], ["chris", "dan"], "draw")];
    expect(storyOf(played, 0.3)).toContain("No bibs were 70% favourites and were held");
  });

  it("marks a first game", () => {
    const played = [...warmUp(), game(["ally", "eve"], ["chris", "dan"], "draw")];
    expect(storyOf(played)).toEqual(["A first game for Eve"]);
  });

  it("marks a round number brought up tonight", () => {
    const played = Array.from({ length: 9 }, () => game(["ally"], ["sam"], "draw"));
    expect(storyOf(played)).toEqual([]);
    played.push(game(["ally"], ["sam"], "draw"));
    expect(storyOf(played)).toEqual(["Ally's 10th game", "Sam's 10th game"]);
  });

  /** A count already sitting on a mark was not brought up by a defeat. */
  it("only credits a round number of wins to somebody who won tonight", () => {
    const played = [
      ...Array.from({ length: 10 }, () => game(["ally"], ["sam"], "a")),
      game(["ally"], ["sam"], "b"),
    ];
    expect(storyOf(played).some((line) => line.includes("10th win"))).toBe(false);
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

  it("says when somebody's run was brought to an end, and by whom", () => {
    const played = [
      ...warmUp(),
      ...Array.from({ length: 4 }, () => game(["ally", "sam"], ["chris", "dan"])),
      game(["ally", "chris"], ["sam", "dan"], "b"),
    ];
    expect(storyOf(played)).toContain("No bibs ended Ally's run of 4 wins");
  });

  it("says two round numbers for one player in one line", () => {
    const played = Array.from({ length: 10 }, () => game(["ally"], ["sam"], "a"));
    expect(storyOf(played)).toContain("Ally's 10th game and 10th win");
  });

  it("tells no more than the card has room for", () => {
    const played = [
      ...Array.from({ length: 9 }, () => game(["ally", "sam"], ["chris", "dan"])),
      game(["ally", "sam", "eve"], ["chris", "dan"], "b"),
    ];
    expect(storyOf(played, 0.8)).toHaveLength(3);
  });

  /** Deleted since: their games still count, but there is nobody to name. */
  it("leaves out anybody the squad no longer has", () => {
    const played = [...warmUp(), game(["ally", "ghost"], ["chris", "dan"], "draw")];
    const story = matchStory({
      match: played.at(-1)!,
      played,
      sides,
      nameOf: (id) => (id === "ghost" ? undefined : nameOf(id)),
    });
    expect(story).toEqual([]);
  });

  it("has nothing to say about a match nobody has played", () => {
    const fixture = { ...game(["ally"], ["sam"]), status: "scheduled" as const, outcome: undefined };
    expect(matchStory({ match: fixture, played: [], sides, nameOf })).toEqual([]);
  });
});
