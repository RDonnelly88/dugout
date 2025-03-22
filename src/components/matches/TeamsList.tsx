
import React from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Match, Player } from "@/types";

interface TeamsListProps {
  match: Match;
  players: Player[];
  getPlayerName: (id: string) => string;
}

const TeamsList = ({ match, players, getPlayerName }: TeamsListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Team A */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {match.teamA.name}
          </CardTitle>
          <CardDescription>
            {match.teamA.players.length} players
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {match.teamA.players.map(playerId => {
              const playerName = getPlayerName(playerId);
              const playerObj = players.find(p => p.id === playerId);
              
              return (
                <Link 
                  key={playerId}
                  to={`/players/${playerId}`}
                  className="flex items-center p-3 rounded-lg hover:bg-blue-50 border border-blue-100 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-3">
                    {playerObj?.image ? (
                      <img
                        src={playerObj.image}
                        alt={playerName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-blue-600">
                        {playerName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{playerName}</span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Team B */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {match.teamB.name}
          </CardTitle>
          <CardDescription>
            {match.teamB.players.length} players
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {match.teamB.players.map(playerId => {
              const playerName = getPlayerName(playerId);
              const playerObj = players.find(p => p.id === playerId);
              
              return (
                <Link 
                  key={playerId}
                  to={`/players/${playerId}`}
                  className="flex items-center p-3 rounded-lg hover:bg-red-50 border border-red-100 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center overflow-hidden mr-3">
                    {playerObj?.image ? (
                      <img
                        src={playerObj.image}
                        alt={playerName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-red-600">
                        {playerName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{playerName}</span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamsList;
