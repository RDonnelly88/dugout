import Link from "next/link";

import { Calendar, Medal, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import PlayerFormDisplay from "@/components/players/PlayerFormDisplay";
import PlayerSeasonStars from "@/components/players/PlayerSeasonStars";
import { winners } from "@/lib/podium";
import { Season, SeasonChampion, PlayerFormResult } from "@/types";

interface SeasonCardProps {
  season: Season;
  champions?: SeasonChampion[];
  totalPlayers: number;
  totalMatches: number;
  playerForms?: Record<string, PlayerFormResult[]>;
}

/** The trophy or medal for a place, or the number when it is outside the top three. */
function Place({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-4 w-4 text-draw" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-muted-foreground" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-draw" />;
  return <span className="tabular text-sm">{rank}</span>;
}

/**
 * A season at a glance.
 *
 * The ranks come from `season_champions`, which already works them out
 * golf-style. This used to sort the rows and derive the ranks a second time in
 * the browser, by a slightly different rule — so the card and the season's own
 * league table could disagree about who came second.
 *
 * It also drew its own avatars out of the lucide namespace and had its own copy
 * of the form squares. Both have one component apiece for a reason: the
 * hand-rolled avatar was how `icon:Ghost` ended up rendering as a broken image
 * in eight of the nine places that showed it.
 */
const SeasonCard = ({
  season,
  champions = [],
  totalPlayers,
  totalMatches,
  playerForms = {},
}: SeasonCardProps) => {
  const startDate = new Date(season.startDate).toLocaleDateString();
  const endDate = season.endDate
    ? new Date(season.endDate).toLocaleDateString()
    : "Ongoing";

  const leaders = winners(champions);
  const top = [...champions].sort((a, b) => a.rank - b.rank).slice(0, 5);

  return (
    <Link href={`/seasons/${season.id}`} className="block h-full">
      <Card className="h-full overflow-hidden border-border bg-surface transition-colors hover:border-border-strong">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="section-title">{season.name}</h3>
            {season.isCurrent && !season.isFinished && (
              <Badge className="shrink-0 bg-win text-win-foreground">Ongoing</Badge>
            )}
            {season.isFinished && (
              <Badge variant="outline" className="shrink-0">
                Finished
              </Badge>
            )}
          </div>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {startDate} – {endDate}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-surface-2/60 p-2 text-center">
              <p className="eyebrow">Matches</p>
              <p className="tabular mt-0.5 font-semibold">{totalMatches}</p>
            </div>
            <div className="rounded-lg bg-surface-2/60 p-2 text-center">
              <p className="eyebrow">Players</p>
              <p className="tabular mt-0.5 font-semibold">{totalPlayers}</p>
            </div>
          </div>

          {leaders.length > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-surface-2/60 p-3">
              <Trophy className="h-5 w-5 shrink-0 text-draw" />
              <div className="min-w-0 flex-1">
                <p className="eyebrow">
                  {leaders.length > 1
                    ? season.isFinished
                      ? "Joint champions"
                      : "Joint leaders"
                    : season.isFinished
                      ? "Champion"
                      : "Leader"}
                </p>
                <p className="truncate font-medium">
                  {leaders.map((leader) => leader.playerName).join(" & ")}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="eyebrow">Points</p>
                <p className="tabular font-semibold">{leaders[0].points}</p>
              </div>
            </div>
          )}

          {top.length > 0 && (
            <div className="mt-4">
              <p className="eyebrow mb-2">Top {top.length}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Form</TableHead>
                    <TableHead className="w-10 text-right">P</TableHead>
                    <TableHead className="w-10 text-right">Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top.map((player) => (
                    <TableRow key={player.playerId}>
                      <TableCell className="py-1.5">
                        <Place rank={player.rank} />
                      </TableCell>
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-2">
                          <PlayerAvatar
                            name={player.playerName}
                            image={player.playerImage}
                            size="xs"
                          />
                          <span className="truncate">{player.playerName}</span>
                          <PlayerSeasonStars playerId={player.playerId} size="sm" />
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5">
                        <div className="flex justify-end">
                          <PlayerFormDisplay
                            results={playerForms[player.playerId] || []}
                            size="xs"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="tabular py-1.5 text-right">
                        {player.played}
                      </TableCell>
                      <TableCell className="tabular py-1.5 text-right font-medium">
                        {player.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default SeasonCard;
