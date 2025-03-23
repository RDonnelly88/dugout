
import React, { useMemo } from 'react';
import { Player } from "@/types";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Flag } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import Formation from './team-randomizer/Formation';
import { PlayerHoverContent } from './team-randomizer/PlayerSelection';
import { calculatePlayerRanks } from "@/lib/ranking-utils";

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
  
  // Calculate player ranks using our shared utility function
  const playerRanks = useMemo(() => {
    if (seasonStats.length === 0) return {};
    return calculatePlayerRanks(seasonStats);
  }, [seasonStats]);
  
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
        <Label className="team-label mb-4 block flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary inline" />
          <span className="text-xl font-bold text-gradient">Team Formations</span>
        </Label>
        
        <Formation 
          teamA={teamAPlayers} 
          teamB={teamBPlayers} 
          teamSize={Math.max(teamAPlayers.length, teamBPlayers.length).toString()}
          onRemovePlayer={handleRemovePlayer}
        />
      </div>

      <div className="available-players-container tech-panel mt-12">
        <div className="tech-panel-header">
          <Label className="team-label flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary inline" />
            <span className="text-xl font-bold text-gradient">Available Players</span>
          </Label>
        </div>
        <div className="tech-panel-content">
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
                  playerRanks={playerRanks}
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
  playerRanks?: Record<string, number>;
}

const PlayerCard = ({ player, currentSeason, seasonStats, onClick, playerRanks = {} }: PlayerCardProps) => {
  // Get player rank from the pre-calculated ranks
  const playerSeasonStat = seasonStats.find(stat => stat.playerId === player.id);
  
  // Only show rank if the player has played games this season
  const hasPlayedGames = playerSeasonStat && playerSeasonStat.played > 0;
  
  // Get the player's rank from the playerRanks object (will be undefined if not ranked)
  const playerRank = hasPlayedGames ? playerRanks[player.id] : null;

  return (
    <div 
      onClick={onClick}
      className="relative cursor-pointer transition-all duration-300 hover:scale-105 animate-pop-in"
    >
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="player-card-mini tech-panel cyber-border p-3 flex items-center space-x-2 shadow-md hover:shadow-primary/20 hover:shadow-lg transition-all duration-200">
            <Avatar className="h-10 w-10 border-2 border-primary/30">
              {player.image ? (
                <AvatarImage src={player.image} alt={player.name} />
              ) : (
                <AvatarFallback className="bg-gray-900 text-primary">
                  {player.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <span className="text-sm font-medium truncate text-white">{player.name}</span>
              {playerRank && (
                <div className="flex items-center text-xs">
                  <Flag className="h-3 w-3 text-primary mr-1" />
                  <span className="text-primary">#{playerRank}</span>
                </div>
              )}
              {!playerRank && hasPlayedGames && (
                <div className="flex items-center text-xs">
                  <Flag className="h-3 w-3 text-gray-500 mr-1" />
                  <span className="text-gray-400">Not ranked</span>
                </div>
              )}
              {!hasPlayedGames && (
                <div className="flex items-center text-xs">
                  <Flag className="h-3 w-3 text-gray-500 mr-1" />
                  <span className="text-gray-400">No games</span>
                </div>
              )}
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-72 p-3 neo-glassmorphism border border-primary/30 text-white">
          <PlayerHoverContent 
            player={player} 
            currentSeasonId={currentSeason?.id || null}
            seasonPlayerStats={seasonStats}
            playerRanks={playerRanks}
          />
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default TeamSelection;
