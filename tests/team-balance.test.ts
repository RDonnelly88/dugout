import { describe, expect, it } from "vitest";
import { randomSplit, splitTeams } from "@/lib/team-balance";

interface P {
  id: string;
  weight: number;
}

const squad = (weights: number[]): P[] =>
  weights.map((weight, i) => ({ id: `p${i}`, weight }));

const weightOf = (p: P) => p.weight;
const ids = (xs: P[]) => xs.map((p) => p.id).sort();

describe("randomSplit", () => {
  it("keeps everybody and duplicates nobody", () => {
    const players = squad([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const { teamA, teamB } = randomSplit(players, weightOf);

    expect([...ids(teamA), ...ids(teamB)].sort()).toEqual(ids(players));
  });

  it("splits evenly, giving the odd player to A", () => {
    const { teamA, teamB } = randomSplit(squad([1, 2, 3, 4, 5]), weightOf);

    expect(teamA).toHaveLength(3);
    expect(teamB).toHaveLength(2);
  });

  it("actually shuffles rather than cutting the list in half", () => {
    const players = squad([1, 2, 3, 4, 5, 6, 7, 8]);
    // A generator that always returns 0 sends every swap to index 0, which
    // reverses the order — enough to prove the shuffle ran.
    const { teamA } = randomSplit(players, weightOf, () => 0);

    expect(ids(teamA)).not.toEqual(ids(players.slice(0, 4)));
  });
});

describe("splitTeams", () => {
  it("returns everyone on one side when there is nobody to play", () => {
    const { teamA, teamB } = splitTeams(squad([5]), "rating", weightOf);

    expect(teamA).toHaveLength(1);
    expect(teamB).toHaveLength(0);
  });

  it("finds the even split when one exists", () => {
    // 1+8 and 4+5 both make nine.
    const { strengthA, strengthB } = splitTeams(
      squad([1, 4, 5, 8]),
      "rating",
      weightOf
    );

    expect(strengthA).toBe(strengthB);
  });

  it("keeps the two best apart", () => {
    const players = squad([100, 99, 10, 9]);
    const { teamA, teamB } = splitTeams(players, "rating", weightOf);

    const bestTogether =
      (teamA.some((p) => p.weight === 100) && teamA.some((p) => p.weight === 99)) ||
      (teamB.some((p) => p.weight === 100) && teamB.some((p) => p.weight === 99));

    expect(bestTogether).toBe(false);
  });

  it("beats a shuffle on evenness, which is the whole point", () => {
    const players = squad([100, 90, 80, 70, 20, 15, 10, 5]);
    const balanced = splitTeams(players, "rating", weightOf);

    // The worst arrangement a shuffle can reach: the top four against the
    // bottom four.
    const lopsided = Math.abs((100 + 90 + 80 + 70) / 4 - (20 + 15 + 10 + 5) / 4);

    expect(balanced.difference).toBeLessThan(lopsided);
  });

  it("gives the same teams twice for the same input", () => {
    const players = squad([12, 7, 19, 3, 15, 8, 11, 4]);

    const first = splitTeams(players, "rating", weightOf);
    const second = splitTeams(players, "rating", weightOf);

    expect(ids(first.teamA)).toEqual(ids(second.teamA));
  });

  it("does not care what order the players arrive in", () => {
    const players = squad([12, 7, 19, 3, 15, 8, 11, 4]);
    const shuffledInput = [...players].reverse();

    const a = splitTeams(players, "rating", weightOf);
    const b = splitTeams(shuffledInput, "rating", weightOf);

    expect(a.difference).toBeCloseTo(b.difference, 9);
  });

  it("handles an odd number without losing anyone", () => {
    const players = squad([9, 8, 7, 6, 5, 4, 3]);
    const { teamA, teamB } = splitTeams(players, "form", weightOf);

    expect(teamA.length + teamB.length).toBe(7);
    expect(Math.abs(teamA.length - teamB.length)).toBe(1);
  });

  it("still splits a crowd too large to enumerate", () => {
    // Above the exhaustive limit the greedy pass takes over; it must still
    // return two sensible sides rather than give up.
    const players = squad(
      Array.from({ length: 24 }, (_, i) => 1000 + i * 7)
    );
    const { teamA, teamB, difference } = splitTeams(players, "rating", weightOf);

    expect(teamA).toHaveLength(12);
    expect(teamB).toHaveLength(12);
    // Greedy on an even spread should land very close.
    expect(difference).toBeLessThan(10);
  });

  it("treats every player as equal when weights are flat", () => {
    const players = squad([50, 50, 50, 50, 50, 50]);
    const { difference } = splitTeams(players, "rating", weightOf);

    expect(difference).toBe(0);
  });
});

describe("splitTeams by skill", () => {
  /**
   * A hand-set level is just another weight, but it is the one that has to work
   * for somebody with no games at all — which is the whole reason it exists.
   */
  it("puts the two strongest on opposite sides", () => {
    const squad = [
      { id: "a", skill: 5 },
      { id: "b", skill: 5 },
      { id: "c", skill: 1 },
      { id: "d", skill: 1 },
    ];

    const split = splitTeams(squad, "skill", (p) => p.skill);

    expect(split.difference).toBe(0);
    expect(split.teamA.map((p) => p.skill).sort()).toEqual([1, 5]);
    expect(split.teamB.map((p) => p.skill).sort()).toEqual([1, 5]);
  });
});
