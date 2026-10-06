import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { sortPlayersByRank } from "@/lib/ranking-utils";
import type { Player, SeasonPlayerStats } from "@/types";

/**
 * Everybody's season as a story, in the table's order: a face each, opening
 * their wrapped.
 */
export default function WrappedPicker({
  seasonId,
  finished,
  table,
  players,
}: {
  seasonId: string;
  finished: boolean;
  table: SeasonPlayerStats[];
  players: Player[];
}) {
  const byId = new Map(players.map((p) => [p.id, p]));
  const rows = sortPlayersByRank(table);
  if (rows.length === 0) return null;

  return (
    <Card id="wrapped" className="grain scroll-mt-24">
      <CardHeader className="pb-3 sm:pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          Wrapped{finished ? "" : " so far"}
        </CardTitle>
        <CardDescription>
          Everybody&apos;s season as a story to tap through, and a picture to send to the group.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="rail-track -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
          {rows.map((row) => {
            const player = byId.get(row.playerId);
            const name = player?.name ?? row.playerName;
            return (
              <li key={row.playerId} className="snap-start">
                <Link
                  href={`/seasons/${seasonId}/wrapped/${row.playerId}`}
                  className="focus-ring flex w-20 flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-colors hover:bg-surface-2"
                >
                  <PlayerAvatar
                    name={name}
                    image={player?.image ?? row.playerImage}
                    size="md"
                    className="ring-2 ring-accent/40"
                  />
                  <span className="w-full truncate text-xs font-medium">{name.split(/\s+/)[0]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
