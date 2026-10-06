import { describe, expect, it } from "vitest";
import { ringOrder, squadWeb } from "@/lib/squad-web";
import { matchExpectations } from "@/lib/expected-wins";
import type { Match } from "@/types";

let counter = 0;
function match(a: string[], b: string[], outcome: "a" | "b" | "draw"): Match {
  const n = ++counter;
  const on = new Date(Date.UTC(2026, 0, n)).toISOString().slice(0, 10);
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

const web = (all: Match[], among?: string[]) =>
  squadWeb(all, matchExpectations(all), among ? new Set(among) : undefined);

const link = (w: ReturnType<typeof web>, x: string, y: string) =>
  w.links.find((l) => (l.a === x && l.b === y) || (l.a === y && l.b === x));

describe("squadWeb", () => {
  it("links only players who shared a side", () => {
    const w = web([match(["a", "b"], ["c"], "a")]);

    expect(link(w, "a", "b")!.ledger.played).toBe(1);
    expect(link(w, "a", "c")).toBeUndefined();
  });

  it("files a pair's nights from their own side", () => {
    const w = web([match(["x"], ["a", "b"], "b"), match(["a", "b"], ["x"], "b")]);
    const ab = link(w, "a", "b")!.ledger;

    expect(ab.played).toBe(2);
    expect([ab.wins, ab.losses]).toEqual([1, 1]);
  });

  it("gives each link one identity whichever way round it was met", () => {
    const w = web([match(["b", "a"], ["c"], "a"), match(["a", "b"], ["c"], "a")]);
    expect(w.links.filter((l) => [l.a, l.b].sort().join() === "a,b")).toHaveLength(1);
  });

  it("leaves out anybody not among the players asked about", () => {
    const w = web([match(["a", "b", "gone"], ["c"], "a")], ["a", "b", "c"]);

    expect(w.players.map((p) => p.playerId).sort()).toEqual(["a", "b", "c"]);
    expect(link(w, "a", "gone")).toBeUndefined();
  });

  it("ignores anything not yet played", () => {
    const fixture: Match = { ...match(["a", "b"], ["c"], "a"), status: "scheduled" };
    expect(web([fixture]).links).toEqual([]);
  });
});

describe("ringOrder", () => {
  it("seats everybody exactly once", () => {
    const w = web([match(["a", "b", "c"], ["d", "e"], "a"), match(["a", "d"], ["b", "e"], "b")]);
    expect(ringOrder(w).sort()).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("seats regular team-mates beside each other", () => {
    const w = web([
      ...Array.from({ length: 4 }, () => match(["a", "b"], ["c", "d"], "a")),
      match(["a", "c"], ["b", "d"], "a"),
    ]);
    const order = ringOrder(w);
    const gap = (x: string, y: string) => Math.abs(order.indexOf(x) - order.indexOf(y));

    expect(gap("a", "b")).toBe(1);
    expect(gap("c", "d")).toBe(1);
  });

  it("draws the same squad the same way every time", () => {
    const all = [match(["a", "b"], ["c", "d"], "a"), match(["a", "c"], ["b", "d"], "draw")];
    expect(ringOrder(web(all))).toEqual(ringOrder(web(all)));
  });

  it("has nobody to seat in an empty stretch", () => {
    expect(ringOrder(web([]))).toEqual([]);
  });
});
