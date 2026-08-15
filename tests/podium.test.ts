import { describe, expect, it } from "vitest";
import { ordinal, podium, winners } from "@/lib/podium";
import type { SeasonChampion } from "@/types";

const champion = (
  playerName: string,
  rank: number,
  points: number
): SeasonChampion =>
  ({
    seasonId: "s1",
    seasonName: "Autumn",
    playerId: playerName.toLowerCase(),
    playerName,
    playerImage: null,
    rank,
    points,
    played: 11,
    wins: 9,
    draws: 1,
    losses: 1,
  }) as SeasonChampion;

describe("podium", () => {
  /**
   * The case that started this: two players level on every tiebreaker took
   * first, and the season card showed one of them while the summary table's
   * runner-up column sat empty.
   */
  it("keeps both winners when first is shared", () => {
    const places = podium([
      champion("Alan", 1, 28),
      champion("Big Dave", 1, 28),
      champion("Boyd", 3, 19),
    ]);

    expect(places).toHaveLength(2);
    expect(places[0].rank).toBe(1);
    expect(places[0].players.map((p) => p.playerName)).toEqual(["Alan", "Big Dave"]);
  });

  it("has no second place when two share the first", () => {
    const places = podium([
      champion("Alan", 1, 28),
      champion("Big Dave", 1, 28),
      champion("Boyd", 3, 19),
    ]);

    expect(places.map((p) => p.rank)).toEqual([1, 3]);
    expect(places.find((p) => p.rank === 2)).toBeUndefined();
  });

  it("drops anyone below the places asked for", () => {
    const places = podium([
      champion("Alan", 1, 28),
      champion("Boyd", 2, 19),
      champion("Ian", 3, 16),
      champion("Fraser", 4, 12),
    ]);

    expect(places.map((p) => p.rank)).toEqual([1, 2, 3]);
  });

  it("is empty for a season nobody has played", () => {
    expect(podium([])).toEqual([]);
    expect(winners([])).toEqual([]);
  });

  it("names every winner", () => {
    expect(
      winners([champion("Alan", 1, 28), champion("Big Dave", 1, 28), champion("Boyd", 3, 19)])
        .map((p) => p.playerName)
    ).toEqual(["Alan", "Big Dave"]);
  });
});

describe("ordinal", () => {
  it("suffixes the usual way", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22].map(ordinal)).toEqual([
      "1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd",
    ]);
  });
});
