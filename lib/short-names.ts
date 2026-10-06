/**
 * The shortest name that still says who somebody is: their first name, unless
 * someone else in the squad shares it, in which case their name in full.
 *
 * Two Rosses both shown as "Ross" would make a line-up unreadable, so a clash
 * costs both of them the short form rather than guessing which one is meant.
 */
export function shortNames(players: { id: string; name: string }[]): Map<string, string> {
  const first = (name: string) => name.trim().split(/\s+/)[0] ?? name;
  const count = new Map<string, number>();
  for (const { name } of players) {
    const key = first(name).toLowerCase();
    count.set(key, (count.get(key) ?? 0) + 1);
  }
  return new Map(
    players.map(({ id, name }) => [
      id,
      count.get(first(name).toLowerCase())! > 1 ? name.trim() : first(name),
    ])
  );
}
