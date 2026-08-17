import { describe, expect, it } from "vitest";
import {
  assign,
  dragged,
  emptyBoard,
  occupants,
  swapSides,
  usable,
  type Board,
} from "@/lib/team-picker";
import type { Player } from "@/types";

const player = (id: string): Player => ({
  id,
  name: id,
  image: null,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  skillLevel: undefined,
});

const squad = ["a", "b", "c", "d", "e"].map(player);
const names = (players: Player[]) => players.map((p) => p.id);

describe("emptyBoard", () => {
  /**
   * Opening on a shuffle meant a side had to be un-picked before it could be
   * picked, and a board that already looks answered invites nudging rather
   * than choosing.
   */
  it("starts with everybody waiting and nobody placed", () => {
    const board = emptyBoard(squad);

    expect(names(occupants(board, "bench", squad))).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
    ]);
    expect(occupants(board, "A", squad)).toEqual([]);
    expect(occupants(board, "B", squad)).toEqual([]);
  });

  it("has nothing usable in it until both sides have somebody", () => {
    const board = emptyBoard(squad);

    expect(usable(board)).toBe(false);
    expect(usable(assign(board, ["a"], "A"))).toBe(false);
    expect(usable(assign(assign(board, ["a"], "A"), ["b"], "B"))).toBe(true);
  });
});

describe("assign", () => {
  const board = assign(
    assign(emptyBoard(squad), ["a", "b"], "A"),
    ["c", "d"],
    "B"
  );

  it("moves a whole group in one go", () => {
    const moved = assign(board, ["a", "b"], "B");

    expect(names(occupants(moved, "B", squad))).toEqual(["a", "b", "c", "d"]);
    expect(occupants(moved, "A", squad)).toEqual([]);
  });

  it("leaves everybody else exactly where they were", () => {
    const moved = assign(board, ["a"], "bench");

    expect(names(occupants(moved, "B", squad))).toEqual(["c", "d"]);
    expect(names(occupants(moved, "A", squad))).toEqual(["b"]);
  });

  it("does not change the board it was handed", () => {
    const before = { ...board };
    assign(board, ["a", "b", "c"], "bench");

    expect(board).toEqual(before);
  });
});

describe("swapSides", () => {
  it("turns the two sides around", () => {
    const board = assign(assign(emptyBoard(squad), ["a"], "A"), ["b"], "B");
    const swapped = swapSides(board);

    expect(names(occupants(swapped, "A", squad))).toEqual(["b"]);
    expect(names(occupants(swapped, "B", squad))).toEqual(["a"]);
  });

  it("leaves the bench alone", () => {
    const board = assign(assign(emptyBoard(squad), ["a"], "A"), ["b"], "B");

    expect(names(occupants(swapSides(board), "bench", squad))).toEqual([
      "c",
      "d",
      "e",
    ]);
  });
});

describe("what a drag carries", () => {
  /**
   * Dragging somebody who is part of the group takes the group. Dragging
   * anybody else takes only them — picking up an unpicked player and having
   * nine others follow is not what the gesture looked like.
   */
  it("takes the whole selection when the dragged player is in it", () => {
    const picked = new Set(["a", "b", "c"]);
    expect([...dragged("b", picked)].sort()).toEqual(["a", "b", "c"]);
  });

  it("takes only the one when they are not in the selection", () => {
    const picked = new Set(["a", "b"]);
    expect([...dragged("e", picked)]).toEqual(["e"]);
  });

  it("takes only the one when nothing is picked out at all", () => {
    expect([...dragged("a", new Set())]).toEqual(["a"]);
  });

  it("hands back a copy, so the selection is not moved by moving players", () => {
    const picked = new Set(["a", "b"]);
    const carried = dragged("a", picked);
    carried.delete("a");

    expect(picked.has("a")).toBe(true);
  });
});

describe("usable", () => {
  it("wants somebody on both sides", () => {
    const oneSided: Board = { a: "A", b: "A", c: "bench" };
    expect(usable(oneSided)).toBe(false);

    expect(usable({ ...oneSided, c: "B" })).toBe(true);
  });

  it("is not satisfied by a full bench", () => {
    expect(usable({ a: "bench", b: "bench" })).toBe(false);
  });
});
