import { supabaseServer } from "@/lib/supabase-server";
import { mapSupabaseMatchToMatch } from "@/lib/supabase-utils";
import { shareCard, type ShareTables } from "@/lib/share-card";
import { cardFonts, matchCardImage } from "@/lib/share-card-image";
import { computeRatings } from "@/lib/elo";
import { recentResults } from "@/lib/recent-results";
import { sideOf } from "@/lib/match-result";
import { nightContext } from "@/lib/match-story";
import { pointValues, type LeagueRow } from "@/lib/season-positions";
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
 * What the result locked in for each side, how far it moved each player once
 * their older games had faded too, and where it left the ladder.
 *
 * Ratings are sequential, so replaying only as far as this match changes
 * nothing about the numbers up to the cut.
 */
function ladderThatNight(played: Match[], match: Match) {
  const ratings = computeRatings(played);

  const points: { a?: number; b?: number } = {};
  const changes = new Map<string, number>();
  for (const rating of ratings.values()) {
    const moment = rating.history.find((point) => point.matchId === match.id);
    const side = sideOf(match, rating.playerId);
    if (moment && side) {
      points[side] = moment.settled;
      changes.set(rating.playerId, moment.change);
    }
  }

  return {
    points,
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
  //
  // The league table comes back whole rather than cut to the rows the card
  // draws, because every place beside a name is read off its order and the
  // players in a match are not the players at the top of it.
  const [{ data: team }, { data: squad }, { data: history }, { data: table }] =
    await Promise.all([
      supabase
        .from("teams")
        .select("side_a_name, side_b_name")
        .eq("id", row.team_id)
        .maybeSingle(),
      supabase.from("players").select("id, name, is_active").eq("team_id", row.team_id),
      supabase.from("matches").select("*").eq("team_id", row.team_id),
      row.season_id
        ? supabase
            .from("season_player_stats")
            .select("points, wins, draws, season_name")
            .eq("season_id", row.season_id)
            .order("points", { ascending: false })
        : Promise.resolve({ data: null }),
    ]);

  const names = new Map((squad ?? []).map((player) => [player.id, player.name]));
  const nameOf = (playerId: string) => names.get(playerId);

  // The league as it stood either side of this match is counted from the
  // season's games with what the view says a win and a draw are worth, so a
  // card for a game from March shows March's table and who it moved.
  const view = (table ?? []).map((entry) => ({
    points: entry.points ?? 0,
    wins: entry.wins ?? 0,
    draws: entry.draws ?? 0,
  }));
  // Everything the card says about where a player stands is worked out from
  // the history to the final whistle and nothing later. A match missing from
  // the history leaves the card with the result and no tables rather than
  // with tables that are wrong.
  const night = nightContext(match, (history ?? []).map(mapSupabaseMatchToMatch), pointValues(view));
  const { played } = night;
  const { points, changes, ranked } = ladderThatNight(played, match);
  // The window ends on the match being shared, so the run beside a name
  // includes the game the card is about.
  const results = new Map(
    [...recentResults(played)].map(([playerId, run]) => [playerId, run.results])
  );

  const named = (rows: LeagueRow[]) =>
    rows.map((r) => ({ ...r, name: nameOf(r.playerId) ?? "Unknown" }));

  const tables: ShareTables = {
    points,
    changes,
    played,
    chanceA: night.chanceA,
    active: new Set((squad ?? []).filter((player) => player.is_active !== false).map((player) => player.id)),
    results,
    ladder: ranked.map((rating) => ({
      playerId: rating.playerId,
      name: nameOf(rating.playerId) ?? "Unknown",
      rating: rating.rating,
    })),
    season: night.season,
    ...(night.table ? { standings: named(night.table.after), previous: named(night.table.before) } : {}),
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
