import { describe, expect, it } from "vitest";
import {
  assign,
  boardFrom,
  dragged,
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

describe("boardFrom", () => {
  it("puts the split's two sides where the split said", () => {
    const board = boardFrom(
      { teamA: [player("a"), player("b")], teamB: [player("c")] },
      squad
    );

    expect(names(occupants(board, "A", squad))).toEqual(["a", "b"]);
    expect(names(occupants(board, "B", squad))).toEqual(["c"]);
  });

  /**
   * Anybody the split did not mention used to land on the first side, which
   * quietly added a player nobody had picked.
   */
  it("benches anyone the split did not cover", () => {
    const board = boardFrom({ teamA: [player("a")], teamB: [player("b")] }, squad);

    expect(names(occupants(board, "bench", squad))).toEqual(["c", "d", "e"]);
  });
});

describe("assign", () => {
  const board = boardFrom(
    { teamA: [player("a"), player("b")], teamB: [player("c"), player("d")] },
    squad
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
    const board = boardFrom(
      { teamA: [player("a")], teamB: [player("b")] },
      squad
    );
    const swapped = swapSides(board);

    expect(names(occupants(swapped, "A", squad))).toEqual(["b"]);
    expect(names(occupants(swapped, "B", squad))).toEqual(["a"]);
  });

  it("leaves the bench alone", () => {
    const board = boardFrom(
      { teamA: [player("a")], teamB: [player("b")] },
      squad
    );

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
