import { describe, expect, it } from "vitest";
import { lineupReport, LINEUP_MAX } from "@/lib/lineup";
import { matchExpectations } from "@/lib/expected-wins";
import { XW } from "@/lib/config";
import type { Match } from "@/types";

let counter = 0;
function match(a: string[], b: string[], outcome: "a" | "b" | "draw"): Match {
  const n = ++counter;
  const on = new Date(Date.UTC(2026, 0, 1 + n)).toISOString().slice(0, 10);
  return {
    id: `m${n}`,
    date: on,
    teamA: { name: "A", players: a },
    teamB: { name: "B", players: b },
    status: "completed",
    outcome,
    createdAt: on,
    updatedAt: on,
  };
}

const report = (all: Match[], ids: string[], candidates: string[] = []) =>
  lineupReport(all, matchExpectations(all), ids, candidates);

describe("lineupReport", () => {
  it("counts only the nights the whole group shared a side", () => {
    const all = [
      match(["ross", "boyd", "ian"], ["x", "y"], "a"),
      match(["ross", "boyd"], ["ian", "x"], "a"),
      match(["ross", "boyd", "ian"], ["x", "y"], "b"),
    ];
    const { together } = report(all, ["ross", "boyd", "ian"]);

    expect(together.played).toBe(2);
    expect([together.wins, together.losses]).toEqual([1, 1]);
  });

  it("shows the rest of the group without each one of them", () => {
    const all = [
      match(["ross", "boyd", "ian"], ["x"], "a"),
      match(["ross", "boyd"], ["ian", "x"], "b"),
      match(["ross", "boyd"], ["x"], "b"),
      match(["boyd", "ian"], ["ross"], "a"),
    ];
    const { without } = report(all, ["ross", "boyd", "ian"]);
    const sheet = (id: string) => without.find((w) => w.playerId === id)!.ledger;

    // Ross and Boyd with Ian not beside them: absent or opposite, two nights.
    expect(sheet("ian").played).toBe(2);
    expect(sheet("ian").wins).toBe(0);
    // Boyd and Ian with Ross elsewhere.
    expect(sheet("ross").played).toBe(1);
  });

  it("has no without for a single player, but still their own record", () => {
    const all = [match(["ross"], ["x"], "a")];
    const result = report(all, ["ross"]);
    expect(result.without).toEqual([]);
    expect(result.alone[0].ledger.played).toBe(1);
  });

  it("ranks who to add by how the group did with them, early ones last", () => {
    const winsWithKev = Array.from({ length: XW.minGames }, () =>
      match(["ross", "boyd", "kev"], ["x", "y", "z"], "a")
    );
    const lossesWithDan = Array.from({ length: XW.minGames }, () =>
      match(["ross", "boyd", "dan"], ["x", "y", "z"], "b")
    );
    const onceWithSam = [match(["ross", "boyd", "sam"], ["x", "y", "z"], "a")];
    const all = [...winsWithKev, ...lossesWithDan, ...onceWithSam];

    const { additions } = report(all, ["ross", "boyd"], ["kev", "dan", "sam", "ross"]);

    expect(additions.map((a) => a.playerId)).toEqual(["kev", "dan", "sam"]);
    expect(additions.at(-1)!.ledger.verdict).toBe("early");
  });

  it("only suggests the candidates it is given", () => {
    const all = [match(["ross", "boyd", "gone"], ["x"], "a")];
    expect(report(all, ["ross", "boyd"], []).additions).toEqual([]);
  });

  it("suggests nobody once the side is full", () => {
    const five = ["a", "b", "c", "d", "e"];
    const all = [match([...five], ["x", "y", "z", "v", "w"], "a")];
    expect(report(all, five, ["x"]).additions).toEqual([]);
  });

  it("asks about a full side at most", () => {
    const six = ["a", "b", "c", "d", "e", "f"];
    const { alone } = report([match(six, ["x"], "a")], six);
    expect(alone).toHaveLength(LINEUP_MAX);
  });
});
