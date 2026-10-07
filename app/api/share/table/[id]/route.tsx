import { supabaseServer } from "@/lib/supabase-server";
import { mapSupabaseMatchToMatch } from "@/lib/supabase-utils";
import { cardFonts } from "@/lib/share-card-image";
import { tableCard } from "@/lib/table-card";
import { tableCardImage } from "@/lib/table-card-image";
import { nightContext } from "@/lib/match-story";
import { pointValues } from "@/lib/season-positions";

/**
 * The tables as they stood after a match, as a PNG for sending to the group.
 *
 * Read through the caller's own Supabase client, like the match card, so
 * row-level security decides who may draw it exactly as it decides who may
 * read the match: no token, and a 404 from the database for anybody who
 * cannot see it.
 */

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: row } = await supabase.from("matches").select("*").eq("id", id).maybeSingle();
  if (!row) return new Response("Not found", { status: 404 });

  const match = mapSupabaseMatchToMatch(row);

  // The names and who is still coming, every match for the ladder, and the
  // season's view for what a win and a draw are worth, each under its own
  // policy and scoped by the team on the match.
  const [{ data: squad }, { data: history }, { data: table }] = await Promise.all([
    supabase.from("players").select("id, name, is_active").eq("team_id", row.team_id),
    supabase.from("matches").select("*").eq("team_id", row.team_id),
    row.season_id
      ? supabase
          .from("season_player_stats")
          .select("points, wins, draws, season_name")
          .eq("season_id", row.season_id)
      : Promise.resolve({ data: null }),
  ]);

  const names = new Map((squad ?? []).map((player) => [player.id, player.name]));
  const view = (table ?? []).map((entry) => ({
    points: entry.points ?? 0,
    wins: entry.wins ?? 0,
    draws: entry.draws ?? 0,
  }));
  // Everything to the final whistle of this match and nothing later, so a
  // card for a night in March shows March's tables.
  const night = nightContext(match, (history ?? []).map(mapSupabaseMatchToMatch), pointValues(view));

  const card = tableCard({
    match,
    played: night.played,
    nameOf: (playerId) => names.get(playerId),
    active: new Set((squad ?? []).filter((player) => player.is_active !== false).map((player) => player.id)),
    league: night.table,
    seasonName: table?.[0]?.season_name ?? undefined,
  });

  if (!card) {
    return new Response("Nothing has moved until it has been played", { status: 409 });
  }

  return tableCardImage(card, await cardFonts());
}
