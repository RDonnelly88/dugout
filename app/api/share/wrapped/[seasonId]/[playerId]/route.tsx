import { supabaseServer } from "@/lib/supabase-server";
import { mapSupabaseMatchToMatch } from "@/lib/supabase-utils";
import { cardFonts } from "@/lib/share-card-image";
import { wrappedImage } from "@/lib/wrapped-image";
import { pointValues } from "@/lib/season-positions";
import { seasonWrapped } from "@/lib/season-wrapped";

/**
 * A player's season wrapped, as a PNG for sending to the group.
 *
 * Read with the caller's cookies, like the match card, so row-level security
 * decides who may draw it exactly as it decides who may read the season: a
 * season somebody cannot see is a 404 from the database itself. What leaves
 * is the picture, never a link.
 */

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ seasonId: string; playerId: string }> }
) {
  const { seasonId, playerId } = await params;
  const supabase = await supabaseServer();

  const { data: season } = await supabase
    .from("seasons")
    .select("id, name, is_finished, team_id")
    .eq("id", seasonId)
    .maybeSingle();
  if (!season) return new Response("Not found", { status: 404 });

  // The whole history, not just the season: the ratings and the odds a season
  // is measured by start where the previous one left everybody.
  const [{ data: squad }, { data: history }, { data: table }] = await Promise.all([
    supabase.from("players").select("id, name").eq("team_id", season.team_id),
    supabase.from("matches").select("*").eq("team_id", season.team_id),
    supabase
      .from("season_player_stats")
      .select("wins, draws, points")
      .eq("season_id", seasonId),
  ]);

  const names = new Map((squad ?? []).map((p) => [p.id, p.name]));
  const values = pointValues(
    (table ?? []).map((row) => ({
      wins: row.wins ?? 0,
      draws: row.draws ?? 0,
      points: row.points ?? 0,
    }))
  );
  const story = seasonWrapped(
    (history ?? []).map(mapSupabaseMatchToMatch),
    seasonId,
    playerId,
    values
  );
  if (!story) return new Response("They did not play in this season", { status: 404 });

  return wrappedImage(
    {
      story,
      playerName: names.get(playerId) ?? "Unknown",
      seasonName: season.name,
      finished: season.is_finished ?? false,
      partnerName: story.partner ? names.get(story.partner.playerId) : undefined,
      nemesisName: story.nemesis ? names.get(story.nemesis.playerId) : undefined,
      values,
    },
    await cardFonts()
  );
}
