
import React, { useMemo } from 'react';
import { Player } from "@/types";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Users } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import Formation from './team-randomizer/Formation';
import { PlayerHoverContent } from './team-randomizer/PlayerSelection';

interface TeamSelectionProps {
  teamA: string[];
  teamB: string[];
  players: Player[];
  selectedPlayers: string[];
  togglePlayer: (team: 'A' | 'B', playerId: string) => void;
}

const TeamSelection = ({ 
  teamA, 
  teamB, 
  players, 
  selectedPlayers,
  togglePlayer 
}: TeamSelectionProps) => {
  console.log("TeamSelection render - Team A:", teamA.length, "players");
  console.log("TeamSelection render - Team B:", teamB.length, "players");
  
  const { data: currentSeason } = useQuery({
    queryKey: ['currentSeason'],
    queryFn: getCurrentSeason
  });
  
  const { data: seasonStats = [] } = useQuery({
    queryKey: ['seasonStats', currentSeason?.id],
    queryFn: () => currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason
  });
  
  const availablePlayers = useMemo(() => {
    return players.filter(player => 
      selectedPlayers.includes(player.id) && 
      !teamA.includes(player.id) && 
      !teamB.includes(player.id)
    );
  }, [players, selectedPlayers, teamA, teamB]);
  
  // Convert player IDs to actual Player objects
  const teamAPlayers = useMemo(() => {
    return players.filter(player => teamA.includes(player.id));
  }, [players, teamA]);
  
  const teamBPlayers = useMemo(() => {
    return players.filter(player => teamB.includes(player.id));
  }, [players, teamB]);
  
  console.log("Team A Players:", teamAPlayers.map(p => p.name));
  console.log("Team B Players:", teamBPlayers.map(p => p.name));

  // Handle removing a player from a team
  const handleRemovePlayer = (team: 'A' | 'B', playerId: string) => {
    togglePlayer(team, playerId);
  };

  return (
    <div className="space-y-8">
      <div className="teams-container">
        <Label className="team-label mb-4 block">
          <Shield className="h-5 w-5 mr-2 text-blue-400 inline" />
          <span className="text-xl font-bold">Team Formations</span>
        </Label>
        
        <Formation 
          teamA={teamAPlayers} 
          teamB={teamBPlayers} 
          teamSize={Math.max(teamAPlayers.length, teamBPlayers.length).toString()}
          onRemovePlayer={handleRemovePlayer}
        />
      </div>

      <div className="available-players-container">
        <Label className="team-label mb-4 block">
          <Users className="h-5 w-5 mr-2 text-gray-400 inline" />
          <span className="text-xl font-bold">Available Players</span>
        </Label>
        <div className="available-players-card bg-blue-950/20 rounded-xl p-4 border border-blue-500/20">
          {availablePlayers.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-lg font-medium">No available players</p>
              <p className="text-sm mt-1">Select players above or add all players to teams</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availablePlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  currentSeason={currentSeason}
                  seasonStats={seasonStats}
                  onClick={() => togglePlayer(teamA.length <= teamB.length ? 'A' : 'B', player.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PlayerCardProps {
  player: Player;
  currentSeason: any;
  seasonStats: any[];
  onClick: () => void;
}

const PlayerCard = ({ player, currentSeason, seasonStats, onClick }: PlayerCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="relative cursor-pointer transition-all duration-300 hover:scale-105 animate-pop-in"
    >
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="player-card-mini bg-blue-900/60 rounded-lg p-3 flex items-center space-x-2 shadow-md border border-blue-500/20 hover:border-blue-400/50 hover:shadow-blue-500/20 hover:shadow-lg transition-all duration-200">
            <Avatar className="h-10 w-10 border-2 border-blue-500/30">
              {player.image ? (
                <AvatarImage src={player.image} alt={player.name} />
              ) : (
                <AvatarFallback className="bg-blue-700 text-white">
                  {player.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm font-medium truncate text-blue-50">{player.name}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-72 p-3 bg-blue-950 border border-blue-500/30 text-white">
          <PlayerHoverContent 
            player={player} 
            currentSeasonId={currentSeason?.id || null}
            seasonPlayerStats={seasonStats}
          />
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default TeamSelection;
