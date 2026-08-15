import Link from "next/link";

import React from "react";

import { Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Match, Player } from "@/types";

interface TeamsListProps {
  match: Match;
  players: Player[];
  getPlayerName: (id: string) => string;
}

const TeamsList = ({ match, players, getPlayerName }: TeamsListProps) => {
  // Early return with null if match teams aren't defined
  if (!match || !match.teamA || !match.teamB) {
    return null;
  }

  // Ensure players arrays exist
  const teamAPlayers = match.teamA.players || [];
  const teamBPlayers = match.teamB.players || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Team A */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {match.teamA.name || "Team A"}
          </CardTitle>
          <CardDescription>
            {teamAPlayers.length} players
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {teamAPlayers.map(playerId => {
              const playerName = getPlayerName(playerId);
              const playerObj = players.find(p => p.id === playerId);
              
              return (
                <Link 
                  key={playerId}
                  href={`/players/${playerId}`}
                  className="flex items-center p-3 rounded-lg hover:bg-info/10 border border-info/20 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-info/15 flex items-center justify-center overflow-hidden mr-3">
                    {playerObj?.image ? (
                      <img
                        src={playerObj.image}
                        alt={playerName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-info">
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
            {match.teamB.name || "Team B"}
          </CardTitle>
          <CardDescription>
            {teamBPlayers.length} players
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {teamBPlayers.map(playerId => {
              const playerName = getPlayerName(playerId);
              const playerObj = players.find(p => p.id === playerId);
              
              return (
                <Link 
                  key={playerId}
                  href={`/players/${playerId}`}
                  className="flex items-center p-3 rounded-lg hover:bg-loss/10 border border-loss/20 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-loss/15 flex items-center justify-center overflow-hidden mr-3">
                    {playerObj?.image ? (
                      <img
                        src={playerObj.image}
                        alt={playerName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-loss">
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
