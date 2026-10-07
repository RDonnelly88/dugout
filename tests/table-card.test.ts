import { describe, expect, it } from "vitest";
import { mover, tableCard } from "@/lib/table-card";
import type { LeagueRow } from "@/lib/season-positions";
import type { Match } from "@/types";

let counter = 0;
function match(a: string[], b: string[], outcome: "a" | "b" | "draw"): Match {
  const n = ++counter;
  const on = new Date(Date.UTC(2026, 4, n)).toISOString().slice(0, 10);
  return {
    id: `t${n}`,
    date: on,
    teamA: { name: "A", players: a },
    teamB: { name: "B", players: b },
    status: "completed",
    outcome,
    createdAt: on,
    updatedAt: on,
  };
}

const nameOf = (id: string) => id.toUpperCase();

// Ann and Cat level on top after the first night, Ann listed first; on the
// second Bob beats Ann, and Cat, sitting out, goes top as Ann drops.
const first = match(["ann", "cat"], ["bob", "dan"], "a");
const second = match(["bob"], ["ann"], "a");
const played = [first, second];

const row = (playerId: string, points: number, played: number, wins: number): LeagueRow => ({
  playerId,
  points,
  played,
  wins,
  draws: played - wins,
});

describe("tableCard", () => {
  it("ranks the ladder after the night with how far everybody moved", () => {
    const card = tableCard({ match: second, played, nameOf })!;
    expect(card.ratings.map((r) => [r.name, r.place, r.moved, r.played])).toEqual([
      ["CAT", 1, 1, false],
      ["BOB", 2, 1, true],
      ["ANN", 3, -2, true],
      ["DAN", 4, 0, false],
    ]);
    // Bob won, Ann lost; Cat and Dan only faded.
    const change = Object.fromEntries(card.ratings.map((r) => [r.name, r.change]));
    expect(change.BOB).toBeGreaterThan(10);
    expect(change.ANN).toBeLessThan(-10);
    expect(Math.abs(change.CAT!)).toBeLessThanOrEqual(1);
  });

  it("says who went top, who climbed and who dropped", () => {
    const card = tableCard({ match: second, played, nameOf })!;
    expect(card.movers).toEqual([
      "CAT goes top of the ratings",
      "BOB climbs 1 to 2nd in the ratings",
      "ANN drops 2 to 3rd in the ratings",
    ]);
  });

  it("lists only the squad as it is and whoever played, placed among themselves", () => {
    const card = tableCard({ match: second, played, nameOf, active: new Set(["dan"]) })!;
    expect(card.ratings.map((r) => [r.name, r.place])).toEqual([
      ["BOB", 1],
      ["ANN", 2],
      ["DAN", 3],
    ]);
  });

  it("gives the league with points gained by whoever played, its climbs said first", () => {
    const card = tableCard({
      match: second,
      played,
      nameOf,
      league: {
        before: [row("ann", 3, 1, 1), row("cat", 3, 1, 1), row("bob", 0, 1, 0), row("dan", 0, 1, 0)],
        after: [row("ann", 3, 2, 1), row("cat", 3, 1, 1), row("bob", 3, 2, 1), row("dan", 0, 1, 0)],
      },
      seasonName: "Autumn 2026",
    })!;
    expect(card.league!.title).toBe("Season Autumn 2026");
    expect(card.league!.rows.map((r) => [r.name, r.place, r.figure, r.change, r.moved])).toEqual([
      ["ANN", 1, 3, 0, 0],
      ["BOB", 1, 3, 3, 2],
      ["CAT", 3, 3, undefined, -2],
      ["DAN", 4, 0, undefined, -1],
    ]);
    // Level at the top is nobody going top; Bob's climb is the league's story.
    expect(card.movers).toEqual([
      "CAT goes top of the ratings",
      "BOB climbs 2 to 1st in the league",
      "BOB climbs 1 to 2nd in the ratings",
    ]);
    expect(card.movers.some((line) => line.includes("goes top of the Season"))).toBe(false);
  });

  it("has nothing to say about a match that has not been counted", () => {
    expect(tableCard({ match: match(["ann"], ["bob"], "a"), played, nameOf })).toBeNull();
  });
});

describe("mover", () => {
  const rows = [
    { playerId: "home", place: 4, moved: 3, change: 1 },
    { playerId: "winner", place: 6, moved: 2, change: 17 },
    { playerId: "loser", place: 9, moved: -2, change: -16 },
  ];

  it("picks somebody who played over a bigger climb made sitting at home", () => {
    expect(mover(rows, 1, (id) => id !== "home")?.playerId).toBe("winner");
  });

  it("falls back to whoever moved most when nobody who played did", () => {
    expect(mover(rows, 1, (id) => id === "loser")?.playerId).toBe("home");
  });

  it("takes the bigger move on the night between two who climbed as far", () => {
    const level = [
      { playerId: "small", place: 3, moved: 2, change: 2 },
      { playerId: "big", place: 4, moved: 2, change: 18 },
    ];
    expect(mover(level, 1, () => true)?.playerId).toBe("big");
  });
});
