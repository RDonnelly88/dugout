
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Trophy, Users, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Season, SeasonChampion } from "@/types";

interface SeasonCardProps {
  season: Season;
  champions?: SeasonChampion[];
  totalPlayers: number;
  totalMatches: number;
}

const SeasonCard = ({ season, champions = [], totalPlayers, totalMatches }: SeasonCardProps) => {
  const topPlayer = champions.length > 0 ? champions[0] : null;
  const startDate = new Date(season.startDate).toLocaleDateString();
  const endDate = season.endDate ? new Date(season.endDate).toLocaleDateString() : "Ongoing";

  return (
    <Link to={`/seasons/${season.id}`}>
      <Card className="overflow-hidden hover:bg-muted/20 transition-colors h-full bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold mb-2">{season.name}</h3>
              {season.isCurrent && (
                <Badge className="bg-green-500 hover:bg-green-600">Current Season</Badge>
              )}
              {season.isFinished && (
                <Badge variant="outline">Finished</Badge>
              )}
            </div>
            
            <div className="flex items-center text-muted-foreground mb-4">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{startDate} - {endDate}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2 bg-muted/20 rounded text-center">
                <div className="text-xs text-muted-foreground">Matches</div>
                <div className="font-semibold">{totalMatches}</div>
              </div>
              <div className="p-2 bg-muted/20 rounded text-center">
                <div className="text-xs text-muted-foreground">Players</div>
                <div className="font-semibold">{totalPlayers}</div>
              </div>
              <div className="p-2 bg-muted/20 rounded text-center">
                <div className="text-xs text-muted-foreground">{season.isFinished ? "Final Rank" : "Current Rank"}</div>
                <div className="font-semibold">{topPlayer ? "#1" : "-"}</div>
              </div>
            </div>
            
            {topPlayer && (
              <div className="flex items-center p-3 bg-muted/20 rounded">
                <Trophy className="h-5 w-5 text-amber-400 mr-2" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    {season.isFinished ? "Champion" : "Leader"}
                  </div>
                  <div className="font-medium">{topPlayer.playerName}</div>
                </div>
                <div className="ml-auto">
                  <div className="text-xs text-muted-foreground">Points</div>
                  <div className="font-semibold text-right">{topPlayer.points}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SeasonCard;
