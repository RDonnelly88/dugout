
import React from "react";
import { Trophy, TrendingUp, TrendingDown, MinusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlayerRecord, SeasonPlayerStats } from "@/types";
import { winRate } from "@/lib/player-stats";

interface PlayerSeasonStatsProps {
  playerName: string;
  /** All-time, from the shared `player_stats` view. */
  overallStats: PlayerRecord;
  seasonStats: SeasonPlayerStats[];
  onSeasonSelect: (seasonId: string | null) => void;
}

const PlayerSeasonStats = ({ 
  playerName, 
  overallStats, 
  seasonStats, 
  onSeasonSelect 
}: PlayerSeasonStatsProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="overall" onValueChange={(value) => onSeasonSelect(value === "overall" ? null : value)}>
          <TabsList className="w-full">
            <TabsTrigger value="overall" className="flex-1">Overall</TabsTrigger>
            {seasonStats.map((stat) => (
              <TabsTrigger key={stat.seasonId} value={stat.seasonId} className="flex-1">
                {stat.seasonName}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="overall" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                label="Matches Played" 
                value={overallStats.played}
                icon={<Trophy className="h-5 w-5 text-blue-500" />}
                bgColor="bg-blue-50"
                textColor="text-blue-800"
              />
              <StatCard 
                label="Victories" 
                value={overallStats.wins}
                icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                bgColor="bg-green-50"
                textColor="text-green-800"
              />
              <StatCard 
                label="Draws" 
                value={overallStats.draws}
                icon={<MinusCircle className="h-5 w-5 text-amber-500" />}
                bgColor="bg-amber-50"
                textColor="text-amber-800"
              />
              <StatCard 
                label="Defeats" 
                value={overallStats.losses}
                icon={<TrendingDown className="h-5 w-5 text-red-500" />}
                bgColor="bg-red-50"
                textColor="text-red-800"
              />
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Stats Summary</h3>
              <p className="text-muted-foreground">
                {playerName} has played a total of {overallStats.played} matches,
                winning {overallStats.wins} ({Math.round(winRate(overallStats) * 100)}%),
                drawing {overallStats.draws}, and losing {overallStats.losses}.
              </p>
            </div>
          </TabsContent>
          
          {seasonStats.map((stat) => (
            <TabsContent key={stat.seasonId} value={stat.seasonId} className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                  label="Matches Played" 
                  value={stat.played}
                  icon={<Trophy className="h-5 w-5 text-blue-500" />}
                  bgColor="bg-blue-50"
                  textColor="text-blue-800"
                />
                <StatCard 
                  label="Victories" 
                  value={stat.wins}
                  icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                  bgColor="bg-green-50"
                  textColor="text-green-800"
                />
                <StatCard 
                  label="Draws" 
                  value={stat.draws}
                  icon={<MinusCircle className="h-5 w-5 text-amber-500" />}
                  bgColor="bg-amber-50"
                  textColor="text-amber-800"
                />
                <StatCard 
                  label="Defeats" 
                  value={stat.losses}
                  icon={<TrendingDown className="h-5 w-5 text-red-500" />}
                  bgColor="bg-red-50"
                  textColor="text-red-800"
                />
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">{stat.seasonName} Summary</h3>
                <p className="text-muted-foreground">
                  In the {stat.seasonName}, {playerName} has played {stat.played} matches, 
                  winning {stat.wins} ({Math.round((stat.wins / stat.played) * 100) || 0}%), 
                  drawing {stat.draws} ({Math.round((stat.draws / stat.played) * 100) || 0}%), 
                  and losing {stat.losses} ({Math.round((stat.losses / stat.played) * 100) || 0}%).
                  With a total of {stat.points} points.
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const StatCard = ({ label, value, icon, bgColor, textColor }: StatCardProps) => {
  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-lg flex flex-col items-center text-center`}>
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
};

export default PlayerSeasonStats;
