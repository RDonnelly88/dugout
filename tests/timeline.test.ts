import { describe, expect, it } from "vitest";
import { withinTimeline } from "@/lib/timeline";
import type { Match } from "@/types";

const match = (id: string, date: string, seasonId?: string, played = true): Match => ({
  id,
  date,
  teamA: { name: "A", players: ["a"] },
  teamB: { name: "B", players: ["b"] },
  status: played ? "completed" : "scheduled",
  outcome: played ? "a" : null,
  seasonId,
  createdAt: date,
  updatedAt: date,
});

const history = [
  match("m1", "2025-01-07", "s1"),
  match("m2", "2025-06-03", "s1"),
  match("m3", "2025-11-04", "s2"),
  match("m4", "2026-02-03", "s2"),
  match("m5", "2026-03-03", "s2"),
  match("fixture", "2026-03-10", "s2", false),
];
const ids = (ms: Match[]) => ms.map((m) => m.id);

describe("withinTimeline", () => {
  it("takes every played match, oldest first, for all time", () => {
    expect(ids(withinTimeline([...history].reverse(), { kind: "all" }))).toEqual([
      "m1",
      "m2",
      "m3",
      "m4",
      "m5",
    ]);
  });

  it("takes one season", () => {
    expect(ids(withinTimeline(history, { kind: "season", seasonId: "s1" }))).toEqual([
      "m1",
      "m2",
    ]);
  });

  it("takes the squad's last few results, not counting a fixture", () => {
    expect(ids(withinTimeline(history, { kind: "recent", matches: 2 }))).toEqual(["m4", "m5"]);
  });

  /** Counted back from the latest result, so a break does not empty it. */
  it("counts months back from the latest result rather than today", () => {
    expect(ids(withinTimeline(history, { kind: "months", months: 6 }))).toEqual([
      "m3",
      "m4",
      "m5",
    ]);
  });

  it("takes a date range including both ends", () => {
    expect(
      ids(withinTimeline(history, { kind: "range", from: "2025-06-03", to: "2026-02-03" }))
    ).toEqual(["m2", "m3", "m4"]);
  });

  it("leaves an open end open", () => {
    expect(ids(withinTimeline(history, { kind: "range", from: "2026-01-01" }))).toEqual([
      "m4",
      "m5",
    ]);
  });
});
