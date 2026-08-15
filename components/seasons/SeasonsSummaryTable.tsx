import Link from "next/link";

import React from "react";

import { Trophy, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SeasonChampion } from "@/types";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { podium, type PodiumPlace } from "@/lib/podium";

interface SeasonsSummaryTableProps {
  seasonsData: {
    id: string;
    name: string;
    isFinished: boolean;
    isCurrent: boolean;
    champions: SeasonChampion[];
  }[];
}

/** Everyone who finished in one place, which is more than one when it is shared. */
function Place({ place, Icon, tone }: { place?: PodiumPlace; Icon: typeof Trophy; tone: string }) {
  if (!place) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="flex flex-col gap-1">
      {place.players.map((player) => (
        <Link
          key={player.playerId}
          href={`/players/${player.playerId}`}
          className="flex items-center gap-2 hover:underline"
        >
          <PlayerAvatar name={player.playerName} image={player.playerImage} size="xs" />
          <span className="truncate">{player.playerName}</span>
          <Icon className={`h-4 w-4 shrink-0 ${tone}`} />
        </Link>
      ))}
    </div>
  );
}

/**
 * Every season and who finished where.
 *
 * A place can be shared and a place can be missing, and both happen in the
 * same season: two players level on points, games and wins take first
 * together, and nobody finishes second at all. Each column used to take the
 * first row matching its rank, so one of two joint winners vanished and the
 * runner-up column sat empty with no explanation.
 */
const SeasonsSummaryTable: React.FC<SeasonsSummaryTableProps> = ({ seasonsData }) => {
  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle>Seasons summary</CardTitle>
        <CardDescription>Who finished where, season by season</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Season</TableHead>
              <TableHead>1st</TableHead>
              <TableHead>2nd</TableHead>
              <TableHead>3rd</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seasonsData.map((season) => {
              const places = podium(season.champions);
              const at = (rank: number) => places.find((p) => p.rank === rank);
              const first = at(1);

              return (
                <TableRow key={season.id}>
                  <TableCell>
                    <Link href={`/seasons/${season.id}`} className="hover:underline">
                      <div className="font-medium">{season.name}</div>
                      <div className="mt-1 flex items-center gap-2">
                        {season.isCurrent && !season.isFinished && (
                          <Badge className="bg-win text-win-foreground text-xs">Ongoing</Badge>
                        )}
                        {season.isFinished && (
                          <Badge variant="outline" className="text-xs">Finished</Badge>
                        )}
                      </div>
                    </Link>
                  </TableCell>

                  <TableCell>
                    {first ? (
                      <Place place={first} Icon={Trophy} tone="text-draw" />
                    ) : (
                      <span className="text-muted-foreground">
                        {season.isFinished ? "No champion" : "In progress"}
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Place place={at(2)} Icon={Medal} tone="text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <Place place={at(3)} Icon={Medal} tone="text-draw" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <p className="mt-3 text-xs text-muted-foreground">
          Places are shared when records are level, so a season with two winners
          has no second place.
        </p>
      </CardContent>
    </Card>
  );
};

export default SeasonsSummaryTable;
