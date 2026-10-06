import type { Player } from "@/types";

/**
 * Who is picked to play, kept across everything that redraws the list.
 *
 * `previous` is null until the squad first arrives, and then everybody
 * active is picked — the people who turn up most weeks. After that the
 * picks are the person's, not the list's: a refetch, a re-sort or a new copy
 * of the same squad keeps them, and only somebody who has left the squad
 * drops out. Resetting on every new copy of the list is how switching the
 * filter to "Everyone" quietly put the whole squad back in.
 */
export function keepSelection(previous: string[] | null, players: Player[]): string[] | null {
  if (previous === null) {
    // An empty list is the squad not having arrived yet, not a squad of
    // nobody: picking from it would settle on no one and keep it that way.
    if (players.length === 0) return null;
    return players.filter((p) => p.isActive !== false).map((p) => p.id);
  }
  const present = new Set(players.map((p) => p.id));
  return previous.filter((id) => present.has(id));
}

/**
 * The players to list for picking: active only or everybody, matching a
 * search, most games first and then by name.
 *
 * Always a new array. Sorting the squad in place reordered the cached list
 * every other page reads, which is what made it look like a new squad.
 */
export function selectionOrder(
  players: Player[],
  {
    activeOnly,
    search = "",
    playedOf,
  }: { activeOnly: boolean; search?: string; playedOf: (player: Player) => number }
): Player[] {
  const term = search.trim().toLowerCase();
  return players
    .filter((p) => !activeOnly || p.isActive !== false)
    .filter((p) => !term || p.name.toLowerCase().includes(term))
    .sort((a, b) => playedOf(b) - playedOf(a) || a.name.localeCompare(b.name));
}
