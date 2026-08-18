import { supabaseServer } from "@/lib/supabase-server";
import { mapSupabaseMatchToMatch } from "@/lib/supabase-utils";
import { shareCard } from "@/lib/share-card";
import { cardFonts, matchCardImage } from "@/lib/share-card-image";
import { SIDE_NAMES } from "@/lib/config";

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
  const ids = [...match.teamA.players, ...match.teamB.players];

  // Two more reads rather than a join: the sides are a team setting and the
  // names are a player one, and both are subject to their own policies.
  const [{ data: team }, { data: squad }] = await Promise.all([
    supabase
      .from("teams")
      .select("side_a_name, side_b_name")
      .eq("id", row.team_id)
      .maybeSingle(),
    supabase.from("players").select("id, name").in("id", ids),
  ]);

  const names = new Map((squad ?? []).map((player) => [player.id, player.name]));
  const card = shareCard(
    match,
    {
      A: team?.side_a_name?.trim() || SIDE_NAMES.A,
      B: team?.side_b_name?.trim() || SIDE_NAMES.B,
    },
    // A player deleted since the match was played still has a shirt on the
    // night, so they keep a place on the card without a name.
    (playerId) => names.get(playerId) ?? "Unknown"
  );

  if (!card) {
    return new Response("Nothing to share until it has been played", {
      status: 409,
    });
  }

  return matchCardImage(card, await cardFonts());
}
