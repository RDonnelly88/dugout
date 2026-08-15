import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatTile, StatTiles } from "@/components/StatTile";
import { PlayerRecord, SeasonPlayerStats } from "@/types";
import { winRate } from "@/lib/player-stats";

interface PlayerSeasonStatsProps {
  playerName: string;
  /** All-time, from the shared `player_stats` view. */
  overallStats: PlayerRecord;
  seasonStats: SeasonPlayerStats[];
  onSeasonSelect: (seasonId: string | null) => void;
}

/** The same four figures whichever tab is open. */
function Tally({
  record,
}: {
  record: Pick<PlayerRecord, "played" | "wins" | "draws" | "losses">;
}) {
  return (
    <StatTiles>
      <StatTile label="Played" value={record.played} />
      <StatTile label="Won" value={record.wins} tone="win" />
      <StatTile label="Drawn" value={record.draws} tone="draw" />
      <StatTile label="Lost" value={record.losses} tone="loss" />
    </StatTiles>
  );
}

/**
 * A player's record, all time and season by season.
 *
 * The tiles are the shared ones. These were four tinted panels with an icon
 * apiece, in colours nothing else on the page used, sitting directly below a
 * second set of tiles in a third style — three designs for one idea.
 */
const PlayerSeasonStats = ({
  playerName,
  overallStats,
  seasonStats,
  onSeasonSelect,
}: PlayerSeasonStatsProps) => {
  return (
    <Card>
      <CardContent>
        <Tabs
          defaultValue="overall"
          onValueChange={(value) => onSeasonSelect(value === "overall" ? null : value)}
        >
          <TabsList className="w-full">
            <TabsTrigger value="overall" className="flex-1">
              All time
            </TabsTrigger>
            {seasonStats.map((stat) => (
              <TabsTrigger key={stat.seasonId} value={stat.seasonId} className="flex-1">
                {stat.seasonName}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overall" className="mt-6">
            <Tally record={overallStats} />
            <p className="mt-4 text-sm text-muted-foreground">
              {overallStats.played === 0
                ? `${playerName} has not played yet.`
                : `${playerName} has won ${Math.round(winRate(overallStats) * 100)}% of ${overallStats.played} matches, for ${overallStats.points} points.`}
            </p>
          </TabsContent>

          {seasonStats.map((stat) => (
            <TabsContent key={stat.seasonId} value={stat.seasonId} className="mt-6">
              <Tally record={stat} />
              <p className="mt-4 text-sm text-muted-foreground">
                {stat.played === 0
                  ? `${playerName} did not play in ${stat.seasonName}.`
                  : `In ${stat.seasonName}, ${playerName} won ${Math.round((stat.wins / stat.played) * 100)}% of ${stat.played} matches, for ${stat.points} points.`}
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlayerSeasonStats;
