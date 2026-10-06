import { describe, expect, it } from "vitest";
import { pointValues, seasonPositions } from "@/lib/season-positions";
import type { Match } from "@/types";

let n = 0;
/** A result with no score, which is how most are recorded. */
function night(
  a: string[],
  b: string[],
  outcome: "a" | "b" | "draw",
  date: string
): Match {
  n++;
  return {
    id: `m${n}`,
    date,
    teamA: { name: "A", players: a },
    teamB: { name: "B", players: b },
    status: "completed",
    outcome,
    createdAt: date,
    updatedAt: date,
  };
}

const VALUES = { win: 3, draw: 1 };

describe("pointValues", () => {
  it("reads what a win and a draw are worth off the table", () => {
    const rows = [
      { wins: 4, draws: 1, points: 13 },
      { wins: 2, draws: 3, points: 9 },
      { wins: 0, draws: 2, points: 2 },
    ];

    expect(pointValues(rows)).toEqual({ win: 3, draw: 1 });
  });

  it("reads any other scheme the view might use", () => {
    const rows = [
      { wins: 3, draws: 1, points: 7 },
      { wins: 1, draws: 2, points: 4 },
    ];

    expect(pointValues(rows)).toEqual({ win: 2, draw: 1 });
  });

  it("still knows a win without a single draw in the season", () => {
    const rows = [
      { wins: 3, draws: 0, points: 9 },
      { wins: 1, draws: 0, points: 3 },
    ];

    expect(pointValues(rows)?.win).toBe(3);
  });

  it("has nothing to say before anybody has won or drawn", () => {
    expect(pointValues([])).toBeNull();
    expect(pointValues([{ wins: 0, draws: 0, points: 0 }])).toBeNull();
  });
});

describe("seasonPositions", () => {
  it("counts a result nobody wrote the score down for", () => {
    const { matches, lines } = seasonPositions(
      [night(["x"], ["y"], "a", "2026-01-06")],
      VALUES
    );

    expect(matches).toHaveLength(1);
    expect(lines.find((l) => l.playerId === "x")!.positions).toEqual([1]);
    expect(lines.find((l) => l.playerId === "y")!.positions).toEqual([2]);
  });

  it("ranks by the league's rules, so level points go to more games played", () => {
    const { lines } = seasonPositions(
      [
        night(["x", "z"], ["y"], "draw", "2026-01-06"),
        night(["x"], ["w"], "draw", "2026-01-13"),
      ],
      VALUES
    );

    // After night two x has 2 points from 2, z and y 1 point from 1, w 1 from 1.
    const after = (id: string) => lines.find((l) => l.playerId === id)!.positions[1];
    expect(after("x")).toBe(1);
    expect(after("y")).toBe(2);
    expect(after("z")).toBe(2);
    expect(after("w")).toBe(2);
  });

  it("leaves a player off the chart until their first game", () => {
    const { lines } = seasonPositions(
      [
        night(["x"], ["y"], "a", "2026-01-06"),
        night(["late"], ["y"], "a", "2026-01-13"),
      ],
      VALUES
    );

    expect(lines.find((l) => l.playerId === "late")!.positions).toEqual([null, 1]);
  });

  it("skips fixtures and keeps two games on one night in order", () => {
    const fixture: Match = {
      ...night(["x"], ["y"], "a", "2026-01-20"),
      status: "scheduled",
      outcome: undefined,
    };
    const first = night(["x"], ["y"], "b", "2026-01-06");
    const second = night(["x"], ["y"], "b", "2026-01-06");

    const { matches } = seasonPositions([second, fixture, first].reverse(), VALUES);

    expect(matches.map((m) => m.id)).toEqual([first.id, second.id]);
  });

  it("lists the lines in the order they finish", () => {
    const { lines } = seasonPositions(
      [
        night(["a"], ["b"], "a", "2026-01-06"),
        night(["c"], ["b"], "a", "2026-01-13"),
        night(["c"], ["a"], "a", "2026-01-20"),
      ],
      VALUES
    );

    expect(lines.map((l) => l.playerId)).toEqual(["c", "a", "b"]);
  });
});
