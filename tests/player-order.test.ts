import { describe, expect, it } from "vitest";
import { orderPlayers, type Sortable } from "@/lib/player-order";
import type { PlayerRating } from "@/lib/elo";
import type { PlayerFormResult } from "@/types";

const rated = (rating: number): PlayerRating =>
  ({ rating }) as PlayerRating;

const p = (
  name: string,
  bits: Partial<Omit<Sortable, "id" | "name">> = {}
): Sortable => ({
  id: name,
  name,
  rating: undefined,
  form: [],
  played: 0,
  wins: 0,
  ...bits,
});

const order = (players: Sortable[], sort: Parameters<typeof orderPlayers>[1]) =>
  orderPlayers(players, sort).map((x) => x.name);

describe("orderPlayers", () => {
  it("puts the best rated at the top", () => {
    const squad = [
      p("mid", { rating: rated(1200) }),
      p("best", { rating: rated(1400) }),
      p("worst", { rating: rated(1000) }),
    ];

    expect(order(squad, "rank")).toEqual(["best", "mid", "worst"]);
  });

  /**
   * Somebody with no games has not been measured, which is a different thing
   * from having been measured badly — so they wait at the bottom rather than
   * sorting as though they were on nought.
   */
  it("sends the unrated to the end rather than treating them as poor", () => {
    const squad = [
      p("unrated"),
      p("poor", { rating: rated(900) }),
      p("good", { rating: rated(1300) }),
    ];

    expect(order(squad, "rank")).toEqual(["good", "poor", "unrated"]);
  });

  it("sorts form on points a game, not on how many results there are", () => {
    const wins = ["win", "win"] as PlayerFormResult[];
    const mixed = ["win", "loss", "win", "loss", "win"] as PlayerFormResult[];

    const squad = [p("mixed", { form: mixed }), p("perfect", { form: wins })];

    expect(order(squad, "form")).toEqual(["perfect", "mixed"]);
  });

  it("ignores games somebody did not play when reading their form", () => {
    const squad = [
      p("patchy", { form: ["win", "dnp", "dnp"] as PlayerFormResult[] }),
      p("steady", { form: ["win", "draw"] as PlayerFormResult[] }),
    ];

    // Three points a game against two, so the patchy one leads despite the
    // gaps — the alternative counts a night off as a defeat.
    expect(order(squad, "form")).toEqual(["patchy", "steady"]);
  });

  it("sorts by games played, most first", () => {
    const squad = [p("few", { played: 2 }), p("many", { played: 40 })];
    expect(order(squad, "played")).toEqual(["many", "few"]);
  });

  it("sorts by win rate rather than wins", () => {
    const squad = [
      p("busy", { played: 40, wins: 20 }),
      p("sharp", { played: 4, wins: 3 }),
    ];

    expect(order(squad, "winRate")).toEqual(["sharp", "busy"]);
  });

  it("counts nobody as winning none of nothing", () => {
    const squad = [p("never", { played: 0, wins: 0 }), p("some", { played: 2, wins: 1 })];
    expect(order(squad, "winRate")).toEqual(["some", "never"]);
  });

  it("sorts by name when asked", () => {
    const squad = [p("Zoe"), p("Alan"), p("Mark")];
    expect(order(squad, "name")).toEqual(["Alan", "Mark", "Zoe"]);
  });

  /**
   * Without a tie-break the grid reshuffles itself between renders, which on
   * a squad where half of them have never played is most of the page.
   */
  it("falls back to the name so the order never wobbles", () => {
    const squad = [p("Zoe"), p("Alan"), p("Mark")];

    for (const sort of ["rank", "form", "played", "winRate"] as const) {
      expect(order(squad, sort)).toEqual(["Alan", "Mark", "Zoe"]);
    }
  });

  it("leaves the list it was given alone", () => {
    const squad = [p("b", { played: 1 }), p("a", { played: 9 })];
    const before = squad.map((x) => x.name);

    orderPlayers(squad, "played");

    expect(squad.map((x) => x.name)).toEqual(before);
  });
});
