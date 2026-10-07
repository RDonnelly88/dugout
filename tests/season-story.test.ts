import { describe, expect, it } from "vitest";
import { seasonNights } from "@/lib/season-story";
import type { Match } from "@/types";

let counter = 0;
function match(date: string, scoreA?: number, scoreB?: number, outcome?: Match["outcome"]): Match {
  const n = ++counter;
  return {
    id: `m${n}`,
    date,
    teamA: { name: "Bibs", players: ["a"], score: scoreA },
    teamB: { name: "No bibs", players: ["b"], score: scoreB },
    status: "completed",
    outcome,
    createdAt: date,
    updatedAt: date,
  };
}

describe("seasonNights", () => {
  it("has nothing to tell for a season with no results", () => {
    const fixture: Match = { ...match("2026-01-01"), status: "scheduled" };
    expect(seasonNights([fixture], { finished: false })).toEqual([]);
  });

  it("tells the opening, the upset and the end in the order they happened", () => {
    const first = match("2026-01-01", 2, 1);
    const upset = match("2026-02-01", 0, 3);
    const middle = match("2026-03-01", 1, 1);
    const last = match("2026-04-01", 4, 2);

    const nights = seasonNights([last, middle, upset, first], {
      upsetMatchId: upset.id,
      finished: true,
    });

    expect(nights.map((n) => n.labels)).toEqual([
      ["Opening night"],
      ["Result of the season"],
      ["Final night"],
    ]);
    expect(nights.map((n) => n.matchId)).toEqual([first.id, upset.id, last.id]);
  });

  it("calls the end of a running season the latest night, not the final one", () => {
    const nights = seasonNights(
      [match("2026-01-01", 1, 0), match("2026-01-08", 0, 1)],
      { finished: false }
    );
    expect(nights.at(-1)!.labels).toEqual(["Latest night"]);
  });

  it("tells a night that was two things once, under both names", () => {
    const only = match("2026-01-01", 3, 2);
    const nights = seasonNights([only], { upsetMatchId: only.id, finished: true });

    expect(nights).toHaveLength(1);
    expect(nights[0].labels).toEqual([
      "Opening night",
      "Result of the season",
      "Final night",
    ]);
  });

  it("carries the score only when both sides have one", () => {
    const scored = match("2026-01-01", 5, 3);
    const scoreless = match("2026-01-08", undefined, undefined, "b");

    const nights = seasonNights([scored, scoreless], { finished: true });

    expect(nights[0].score).toEqual([5, 3]);
    expect(nights[1].score).toBeUndefined();
    expect(nights[1].outcome).toBe("b");
  });

  it("tells every night between that has something worth saying", () => {
    const first = match("2026-01-01", 2, 1);
    const quiet = match("2026-02-01", 1, 1);
    const eventful = match("2026-03-01", 3, 0);
    const last = match("2026-04-01", 4, 2);
    const nights = seasonNights([first, quiet, eventful, last], {
      finished: true,
      stories: new Map([
        [eventful.id, ["Ally has won 3 in a row"]],
        [quiet.id, []],
      ]),
    });

    expect(nights.map((n) => n.matchId)).toEqual([first.id, eventful.id, last.id]);
    expect(nights[1].labels).toEqual([]);
    expect(nights[1].story).toEqual(["Ally has won 3 in a row"]);
  });
});
