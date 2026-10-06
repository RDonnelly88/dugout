import { describe, expect, it } from "vitest";
import { playerSeasons } from "@/lib/player-seasons";
import { highlightsFor } from "@/lib/player-highlights";
import { matchExpectations } from "@/lib/expected-wins";
import type { Match, Season } from "@/types";

let n = 0;
function night(a: string[], b: string[], outcome: "a" | "b" | "draw", date: string, seasonId: string): Match {
  n++;
  return {
    id: `m${n}`,
    seasonId,
    date,
    teamA: { name: "A", players: a },
    teamB: { name: "B", players: b },
    status: "completed",
    outcome,
    createdAt: date,
    updatedAt: date,
  };
}

const season = (id: string, startDate: string, isCurrent = false): Season => ({
  id,
  name: id,
  startDate,
  isCurrent,
  isFinished: !isCurrent,
  createdAt: startDate,
  updatedAt: startDate,
});

const VALUES = { win: 3, draw: 1 };
const SEASONS = [season("old", "2025-01-01"), season("new", "2026-01-01", true)];

describe("playerSeasons", () => {
  const matches = [
    night(["x"], ["y"], "a", "2025-01-08", "old"),
    night(["x"], ["y"], "draw", "2025-01-15", "old"),
    night(["y"], ["x"], "a", "2026-01-08", "new"),
  ];

  it("lists every season they played in, newest first, with its record", () => {
    const rows = playerSeasons(matches, SEASONS, "x", VALUES);
    expect(rows.map((r) => r.season.id)).toEqual(["new", "old"]);
    expect(rows[1]).toMatchObject({ played: 2, wins: 1, draws: 1, losses: 0, points: 4 });
  });

  it("gives the place the season's own table gives", () => {
    const rows = playerSeasons(matches, SEASONS, "x", VALUES);
    expect(rows.find((r) => r.season.id === "old")!.place).toEqual({ position: 1, of: 2 });
    expect(rows.find((r) => r.season.id === "new")!.place).toEqual({ position: 2, of: 2 });
  });

  it("leaves out a season they sat out", () => {
    expect(playerSeasons(matches, [...SEASONS, season("empty", "2024-01-01")], "x", VALUES)).toHaveLength(2);
  });

  it("has no points or place without the table's values", () => {
    const rows = playerSeasons(matches, SEASONS, "x", null);
    expect(rows.every((r) => r.points === null && r.place === null)).toBe(true);
  });
});

describe("highlightsFor across seasons", () => {
  it("reads a run that spans a season boundary as one run", () => {
    const matches = [
      night(["x"], ["y"], "a", "2025-01-08", "old"),
      night(["x"], ["y"], "a", "2025-01-15", "old"),
      night(["x"], ["y"], "a", "2026-01-08", "new"),
      night(["y"], ["x"], "a", "2026-01-15", "new"),
    ];
    const all = highlightsFor(matches, matchExpectations(matches), "x", VALUES)!;
    expect(all.winRun).toBe(3);
    expect(all.record.played).toBe(4);

    const oneSeason = highlightsFor(
      matches.filter((m) => m.seasonId === "new"),
      matchExpectations(matches),
      "x",
      VALUES
    )!;
    expect(oneSeason.winRun).toBe(1);
  });

  it("has nothing to say about somebody who did not play", () => {
    const matches = [night(["x"], ["y"], "a", "2025-01-08", "old")];
    expect(highlightsFor(matches, matchExpectations(matches), "z", VALUES)).toBeNull();
  });
});
