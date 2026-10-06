import { describe, expect, it } from "vitest";
import { chemistryFor, pick } from "@/lib/chemistry";
import { ledger, matchExpectations, type Night } from "@/lib/expected-wins";
import { XW } from "@/lib/config";
import type { Match } from "@/types";

let n = 0;
function match(a: string[], b: string[], scoreA: number, scoreB: number): Match {
  n++;
  const date = new Date(Date.UTC(2026, 0, n)).toISOString().slice(0, 10);
  return {
    id: `m${n}`,
    date,
    teamA: { name: "A", players: a, score: scoreA },
    teamB: { name: "B", players: b, score: scoreB },
    status: "completed",
    createdAt: date,
    updatedAt: date,
  };
}

const report = (all: Match[], id: string) => chemistryFor(all, matchExpectations(all), id);

const find = <T extends { playerId: string }>(entries: T[], id: string): T =>
  entries.find((e) => e.playerId === id)!;

describe("chemistryFor", () => {
  it("splits teammates from opponents", () => {
    const result = report([match(["a", "b"], ["c"], 3, 1)], "a");

    expect(result.withPlayers.map((e) => e.playerId)).toEqual(["b"]);
    expect(result.againstPlayers.map((e) => e.playerId)).toEqual(["c"]);
  });

  it("counts the same pair on both sides of the pitch", () => {
    const result = report([match(["a", "b"], ["c"], 3, 1), match(["a"], ["b"], 1, 2)], "a");

    expect(find(result.withPlayers, "b").ledger.played).toBe(1);
    const against = find(result.againstPlayers, "b").ledger;
    expect([against.played, against.losses]).toEqual([1, 1]);
  });

  it("ignores matches that never finished", () => {
    const unplayed: Match = { ...match(["a", "b"], ["c"], 0, 0), status: "scheduled" };
    expect(report([unplayed], "a").own.played).toBe(0);
  });

  it("measures a partnership against the odds, not against nothing", () => {
    // Even sides, so every game together was a coin flip the pair kept winning.
    const together = Array.from({ length: 6 }, () => match(["a", "b"], ["c", "d"], 1, 0));
    const pair = find(report(together, "a").withPlayers, "b").ledger;

    expect(pair.actual).toBe(6);
    expect(pair.expected).toBeLessThan(pair.actual);
    expect(pair.above).toBeGreaterThan(0);
  });

  /** One lucky night used to be presented as a player's best partnership. */
  it("calls a single game together too early to say", () => {
    const result = report([match(["a", "b"], ["c"], 3, 1)], "a");
    expect(find(result.withPlayers, "b").ledger.verdict).toBe("early");
  });

  it("orders teammates by how far they beat the odds, best first", () => {
    const result = report(
      [
        match(["a", "good"], ["x"], 3, 0),
        match(["a", "good"], ["x"], 3, 0),
        match(["a", "bad"], ["x"], 0, 3),
        match(["a", "bad"], ["x"], 0, 3),
      ],
      "a"
    );

    expect(result.withPlayers.map((e) => e.playerId)).toEqual(["good", "bad"]);
    expect(find(result.withPlayers, "good").ledger.above).toBeGreaterThan(0);
    expect(find(result.withPlayers, "bad").ledger.above).toBeLessThan(0);
  });
});

describe("pick", () => {
  const night = (actual: number): Night => ({
    matchId: `p${++n}`,
    date: "2026-01-01",
    result: actual === 1 ? "win" : "loss",
    actual,
    expected: 0.5,
  });
  const games = (count: number, actual: number) => Array.from({ length: count }, () => night(actual));
  const entries = [
    { playerId: "plenty", ledger: ledger(games(XW.minGames + 2, 1)) },
    { playerId: "some", ledger: ledger(games(XW.minGames, 0)) },
    { playerId: "barely", ledger: ledger(games(1, 1)) },
  ];

  it("drops anyone with too few games to say", () => {
    expect(pick(entries).map((e) => e.playerId)).toEqual(["plenty", "some"]);
  });

  it("takes the other end of the same eligible list", () => {
    expect(pick(entries, { worst: true }).map((e) => e.playerId)).toEqual(["some", "plenty"]);
  });
});
