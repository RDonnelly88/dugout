import { supabaseServer } from "@/lib/supabase-server";
import { mapSupabaseMatchToMatch } from "@/lib/supabase-utils";
import { shareCard, type ShareTables } from "@/lib/share-card";
import { cardFonts, matchCardImage } from "@/lib/share-card-image";
import { computeRatings } from "@/lib/elo";
import { outcomeOf } from "@/lib/match-result";
import { SIDE_NAMES } from "@/lib/config";
import type { Match } from "@/types";

/**
 * A match as a PNG, for sending to the group.
 *
 * Read through the ordinary Supabase client with the caller's cookies, so
 * row-level security decides who may draw a card exactly as it decides who
 * may read the match. No token to mint, expire or leak: somebody who cannot
 * see the match gets a 404 from the database itself, and the demo team is
 * shareable by anybody because it is readable by anybody.
 *
 * The picture is meant to leave, but the URL is not — the share button hands
 * the operating system the image file, so nothing has to be reachable by the
 * people who end up looking at it.
 */

// `next/og` needs the Node runtime for the wasm renderer, and the Supabase
// cookie client is happier there too.
export const runtime = "nodejs";

/**
 * What the night did to everybody, and where it left the ladder.
 *
 * The history is replayed only as far as this match, which is what makes the
 * card true for a game from March rather than a picture of March's result
 * over August's table. Ratings are sequential, so cutting the replay short
 * changes nothing about the numbers up to the cut.
 */
function ladderThatNight(history: Match[], match: Match) {
  const played = history
    .filter((m) => outcomeOf(m) !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const index = played.findIndex((m) => m.id === match.id);
  if (index === -1) return { changes: new Map<string, number>(), ranked: [] };

  const ratings = computeRatings(played.slice(0, index + 1));

  const changes = new Map<string, number>();
  for (const rating of ratings.values()) {
    const moment = rating.history.find((point) => point.matchId === match.id);
    if (moment) changes.set(rating.playerId, moment.change);
  }

  return {
    changes,
    ranked: [...ratings.values()].sort((a, b) => b.rating - a.rating),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: row } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!row) return new Response("Not found", { status: 404 });

  const match = mapSupabaseMatchToMatch(row);

  // Four reads rather than a join: the sides are a team setting, the names a
  // player one, the ladder is replayed from every match the squad has played,
  // and the league table is a view that owns the points. Each is subject to
  // its own policy, and every one of them is scoped by the team on the match.
  const [{ data: team }, { data: squad }, { data: history }, { data: table }] =
    await Promise.all([
      supabase
        .from("teams")
        .select("side_a_name, side_b_name")
        .eq("id", row.team_id)
        .maybeSingle(),
      supabase.from("players").select("id, name").eq("team_id", row.team_id),
      supabase.from("matches").select("*").eq("team_id", row.team_id),
      row.season_id
        ? supabase
            .from("season_player_stats")
            .select("player_id, player_name, points, season_name")
            .eq("season_id", row.season_id)
            .order("points", { ascending: false })
            .limit(5)
        : Promise.resolve({ data: null }),
    ]);

  const names = new Map((squad ?? []).map((player) => [player.id, player.name]));
  // A player deleted since the match was played still has a shirt on the
  // night, so they keep a place on the card without a name.
  const nameOf = (playerId: string) => names.get(playerId) ?? "Unknown";

  const { changes, ranked } = ladderThatNight(
    (history ?? []).map(mapSupabaseMatchToMatch),
    match
  );

  const tables: ShareTables = {
    changes,
    ladder: ranked.map((rating) => ({
      playerId: rating.playerId,
      name: nameOf(rating.playerId),
      rating: rating.rating,
    })),
    standings: (table ?? []).flatMap((entry) =>
      entry.player_id
        ? [
            {
              playerId: entry.player_id,
              name: entry.player_name ?? "Unknown",
              points: entry.points ?? 0,
            },
          ]
        : []
    ),
    seasonName: table?.[0]?.season_name ?? undefined,
  };

  const card = shareCard(
    match,
    {
      A: team?.side_a_name?.trim() || SIDE_NAMES.A,
      B: team?.side_b_name?.trim() || SIDE_NAMES.B,
    },
    nameOf,
    tables
  );

  if (!card) {
    return new Response("Nothing to share until it has been played", {
      status: 409,
    });
  }

  return matchCardImage(card, await cardFonts());
}
