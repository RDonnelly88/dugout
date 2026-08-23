import { describe, expect, it } from "vitest";
import { mapMatchUpdateToSupabase } from "@/lib/supabase-utils";

/**
 * What an edit actually writes.
 *
 * A field the mapping forgets is not a crash: the update succeeds, the screen
 * shows what was typed, and the one thing that changed is the one thing that
 * did not save. Recording a winner without a score is the case where nothing
 * else covers for it — with a score the database derives the outcome itself,
 * so a dropped outcome only shows on the matches nobody counted the goals for.
 */
describe("mapMatchUpdateToSupabase", () => {
  it("writes the result of a match recorded without a score", () => {
    expect(mapMatchUpdateToSupabase({ status: "completed", outcome: "a" })).toEqual({
      status: "completed",
      outcome: "a"
    });
  });

  it("writes a result being cleared", () => {
    expect(mapMatchUpdateToSupabase({ outcome: null })).toEqual({ outcome: null });
  });

  it("writes the notes", () => {
    expect(mapMatchUpdateToSupabase({ notes: "Rain stopped play" })).toEqual({
      notes: "Rain stopped play"
    });
  });

  it("writes both sides and the season", () => {
    const teamA = { name: "Bibs", players: ["a"], score: 3 };
    const teamB = { name: "No bibs", players: ["b"], score: 1 };

    expect(
      mapMatchUpdateToSupabase({ teamA, teamB, seasonId: "s1", date: "2026-08-24" })
    ).toEqual({ team_a: teamA, team_b: teamB, season_id: "s1", date: "2026-08-24" });
  });

  /** An edit says what changed. Everything else is left as it stands. */
  it("writes nothing for a field it was not given", () => {
    expect(mapMatchUpdateToSupabase({ status: "completed" })).toEqual({
      status: "completed"
    });
  });
});
