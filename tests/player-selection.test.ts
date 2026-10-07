import { describe, expect, it } from "vitest";
import { keepSelection, selectionOrder } from "@/lib/player-selection";
import type { Player } from "@/types";

const player = (id: string, isActive = true, name = id): Player => ({
  id,
  name,
  image: null,
  createdAt: "",
  updatedAt: "",
  isActive,
});

describe("keepSelection", () => {
  it("picks everybody active when the squad first arrives", () => {
    expect(keepSelection(null, [player("a"), player("b", false), player("c")])).toEqual(["a", "c"]);
  });

  /**
   * The page renders once before the squad has loaded, with an empty list.
   * Settling on nobody then left every active player unpicked once the squad
   * did arrive.
   */
  it("waits for the squad before picking anybody", () => {
    const beforeLoad = keepSelection(null, []);
    expect(beforeLoad).toBeNull();
    expect(keepSelection(beforeLoad, [player("a"), player("b")])).toEqual(["a", "b"]);
  });

  it("keeps the picks when the same squad arrives again as a new list", () => {
    const squad = [player("a"), player("b"), player("c", false)];
    const picked = ["c"];

    expect(keepSelection(picked, [...squad].reverse())).toEqual(["c"]);
  });

  it("keeps nobody picked when nobody was", () => {
    expect(keepSelection([], [player("a")])).toEqual([]);
  });

  it("drops only somebody who has left the squad", () => {
    expect(keepSelection(["a", "gone"], [player("a"), player("b")])).toEqual(["a"]);
  });
});

describe("selectionOrder", () => {
  const playedOf = (p: Player) => ({ a: 3, b: 9, c: 3 })[p.id as "a" | "b" | "c"] ?? 0;

  it("never reorders the list it was given", () => {
    const squad = [player("a"), player("b", false), player("c")];
    const before = squad.map((p) => p.id);

    selectionOrder(squad, { activeOnly: false, playedOf });

    expect(squad.map((p) => p.id)).toEqual(before);
  });

  it("lists most games first, then by name, and filters", () => {
    const squad = [player("c"), player("b", false), player("a")];

    expect(selectionOrder(squad, { activeOnly: false, playedOf }).map((p) => p.id)).toEqual(["b", "a", "c"]);
    expect(selectionOrder(squad, { activeOnly: true, playedOf }).map((p) => p.id)).toEqual(["a", "c"]);
    expect(selectionOrder(squad, { activeOnly: false, search: " B ", playedOf }).map((p) => p.id)).toEqual(["b"]);
  });
});
