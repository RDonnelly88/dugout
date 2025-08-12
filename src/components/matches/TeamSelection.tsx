
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
import { Card, CardContent } from "@/components/ui/card";

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
    const filtered = players.filter(player => 
      selectedPlayers.includes(player.id) && 
      !teamA.includes(player.id) && 
      !teamB.includes(player.id)
    );
    
    // Sort by frequency (games played) descending, then by name
    return filtered.sort((a, b) => {
      const aSeasonStats = seasonStats.find(stat => stat.playerId === a.id);
      const bSeasonStats = seasonStats.find(stat => stat.playerId === b.id);
      
      // Use season stats if available, otherwise overall stats
      const aPlayed = aSeasonStats?.played || a.stats?.played || 0;
      const bPlayed = bSeasonStats?.played || b.stats?.played || 0;
      
      if (aPlayed !== bPlayed) {
        return bPlayed - aPlayed; // Most frequent first
      }
      return a.name.localeCompare(b.name); // Then alphabetically
    });
  }, [players, selectedPlayers, teamA, teamB, seasonStats]);
  
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
          <Shield className="h-5 w-5 mr-2 text-accent inline" />
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
          <Users className="h-5 w-5 mr-2 text-accent inline" />
          <span className="text-xl font-bold">Available Players</span>
        </Label>
        <div className="available-players-grid">
          {availablePlayers.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-lg font-medium">No available players</p>
              <p className="text-sm mt-1">Select players above or add all players to teams</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
    <Card 
      onClick={onClick}
      className="player-card hover:shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 animate-pop-in overflow-hidden bg-card border-accent/30 shadow-accent/10"
    >
      <CardContent className="p-0">
        <div className="p-4 flex items-center space-x-3">
          <Avatar className="h-12 w-12 border-2 border-accent/30">
            {player.image ? (
              <AvatarImage src={player.image} alt={player.name} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-accent/30 text-white">
                {player.name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{player.name}</div>
            {playerRank && (
              <div className="flex items-center text-xs">
                <Flag className="h-3 w-3 text-yellow-500 mr-1" />
                <span className="text-yellow-300">#{playerRank}</span>
              </div>
            )}
            {!playerRank && hasPlayedGames && (
              <div className="flex items-center text-xs">
                <Flag className="h-3 w-3 text-yellow-500 mr-1" />
                <span className="text-yellow-300">Not ranked</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="player-stats grid grid-cols-3 p-2 bg-accent/10 border-t">
          <div className="stat-item flex flex-col items-center justify-center p-1">
            <span className="text-xs text-muted-foreground">Played</span>
            <span className="font-semibold">{
              (() => {
                const seasonStat = seasonStats.find(stat => stat.playerId === player.id);
                // Always show current season games if available, otherwise total games
                return seasonStat?.played || player.stats?.played || 0;
              })()
            }</span>
          </div>
          <div className="stat-item flex flex-col items-center justify-center p-1">
            <span className="text-xs text-muted-foreground">Won</span>
            <span className="font-semibold text-green-400">{
              (() => {
                const seasonStat = seasonStats.find(stat => stat.playerId === player.id);
                return seasonStat?.wins || player.stats?.won || 0;
              })()
            }</span>
          </div>
          <div className="stat-item flex flex-col items-center justify-center p-1">
            <span className="text-xs text-muted-foreground">Lost</span>
            <span className="font-semibold text-red-400">{
              (() => {
                const seasonStat = seasonStats.find(stat => stat.playerId === player.id);
                return seasonStat?.losses || player.stats?.lost || 0;
              })()
            }</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSelection;
