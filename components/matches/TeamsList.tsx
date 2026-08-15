"use client";

import Link from "next/link";

import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { useSideNames } from "@/hooks/useSideNames";
import { Match, Player } from "@/types";

interface TeamsListProps {
  match: Match;
  players: Player[];
  getPlayerName: (id: string) => string;
}

/**
 * Who lined up on each side.
 *
 * The faces come from `PlayerAvatar`, like everywhere else. This drew its own
 * `<img src={player.image}>`, and `image` also holds the avatar registry's
 * `icon:Ghost` form — which is not a URL, so every player who had picked an
 * icon rather than uploading a photo showed a broken image here and nowhere
 * else.
 */
const TeamsList = ({ match, players, getPlayerName }: TeamsListProps) => {
  const sides = useSideNames();

  if (!match?.teamA || !match?.teamB) return null;

  const byId = new Map(players.map((player) => [player.id, player]));

  const side = (
    key: "A" | "B",
    playerIds: string[],
    tone: { border: string; hover: string }
  ) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 shrink-0 text-muted-foreground" />
          {sides[key]}
        </CardTitle>
        <CardDescription>
          {playerIds.length} {playerIds.length === 1 ? "player" : "players"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {playerIds.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nobody on this side.
          </p>
        ) : (
          <ul className="space-y-2">
            {playerIds.map((playerId) => {
              const name = getPlayerName(playerId);
              return (
                <li key={playerId}>
                  <Link
                    href={`/players/${playerId}`}
                    className={`focus-ring flex items-center gap-3 rounded-lg border p-3 transition-colors ${tone.border} ${tone.hover}`}
                  >
                    <PlayerAvatar
                      name={name}
                      image={byId.get(playerId)?.image}
                      size="sm"
                    />
                    <span className="truncate font-medium">{name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      {side("A", match.teamA.players ?? [], {
        border: "border-info/20",
        hover: "hover:bg-info/10",
      })}
      {side("B", match.teamB.players ?? [], {
        border: "border-accent/20",
        hover: "hover:bg-accent/10",
      })}
    </div>
  );
};

export default TeamsList;
