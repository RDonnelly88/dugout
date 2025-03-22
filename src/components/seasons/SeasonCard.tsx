
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Trophy, Crown, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Season, SeasonChampion } from "@/types";

interface SeasonCardProps {
  season: Season;
  champions?: SeasonChampion[];
  totalPlayers?: number;
  totalMatches?: number;
}

const SeasonCard = ({ season, champions = [], totalPlayers = 0, totalMatches = 0 }: SeasonCardProps) => {
  const champion = champions.find(c => c.rank === 1);
  const startDate = new Date(season.startDate).toLocaleDateString();
  const endDate = season.endDate ? new Date(season.endDate).toLocaleDateString() : "Ongoing";
  
  return (
    <Link to={`/seasons/${season.id}`}>
      <Card className="hover-scale overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{season.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{startDate} - {endDate}</span>
                </div>
              </div>
              {season.isCurrent && (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Current Season
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4">
              {champion && (
                <div className="flex items-center p-2 bg-amber-50 text-amber-800 rounded-md">
                  <Crown className="h-4 w-4 mr-2 text-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">Champion</span>
                    <span className="text-sm">{champion.playerName}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center p-2 bg-blue-50 text-blue-800 rounded-md">
                <Trophy className="h-4 w-4 mr-2 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">Matches</span>
                  <span className="text-sm">{totalMatches}</span>
                </div>
              </div>
              
              <div className="flex items-center p-2 bg-purple-50 text-purple-800 rounded-md">
                <Users className="h-4 w-4 mr-2 text-purple-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">Players</span>
                  <span className="text-sm">{totalPlayers}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SeasonCard;
