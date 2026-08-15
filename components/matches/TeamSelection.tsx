
import React, { useMemo, useState } from 'react';
import { Player } from "@/types";
import { Label } from "@/components/ui/label";

import { Shield, Users, Flag } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import Formation from './team-randomizer/Formation';

import { calculatePlayerRanks } from "@/lib/ranking-utils";
import { Card, CardContent } from "@/components/ui/card";
import PlayerSelectionFilters from './team-randomizer/PlayerSelectionFilters';
import PlayerAvatar from "@/components/players/PlayerAvatar";

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
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  
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
    let filtered = players.filter(player => 
      selectedPlayers.includes(player.id) && 
      !teamA.includes(player.id) && 
      !teamB.includes(player.id)
    );
    
    console.log("Before filters - available players:", filtered.length);
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log("After search filter:", filtered.length);
    }
    
    // Apply active filter
    if (showActiveOnly) {
      filtered = filtered.filter(player => player.isActive);
      console.log("After active filter:", filtered.length);
    }
    
    // Sort by frequency (games played) descending, then by name
    const sorted = filtered.sort((a, b) => {
      const aSeasonStats = seasonStats.find(stat => stat.playerId === a.id);
      const bSeasonStats = seasonStats.find(stat => stat.playerId === b.id);
      
      // Use current season stats only, don't fall back to overall stats
      const aPlayed = aSeasonStats?.played || 0;
      const bPlayed = bSeasonStats?.played || 0;
      
      console.log(`Comparing ${a.name} (${aPlayed} games) vs ${b.name} (${bPlayed} games)`);
      
      if (aPlayed !== bPlayed) {
        return bPlayed - aPlayed; // Most frequent first
      }
      return a.name.localeCompare(b.name); // Then alphabetically
    });
    
    console.log("Final sorted players:", sorted.map(p => {
      const stats = seasonStats.find(stat => stat.playerId === p.id);
      return `${p.name}: ${stats?.played || 0} games`;
    }));
    
    return sorted;
  }, [players, selectedPlayers, teamA, teamB, seasonStats, searchTerm, showActiveOnly]);
  
  // Calculate filter counts
  const baseAvailablePlayers = players.filter(player => 
    selectedPlayers.includes(player.id) && 
    !teamA.includes(player.id) && 
    !teamB.includes(player.id)
  );
  const totalCount = baseAvailablePlayers.length;
  const filteredCount = availablePlayers.length;
  
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
        
        <PlayerSelectionFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showActiveOnly={showActiveOnly}
          setShowActiveOnly={setShowActiveOnly}
          totalCount={totalCount}
          filteredCount={filteredCount}
          selectedCount={0} // Not applicable here since these are available players
        />
        
        <div className="available-players-grid mt-4">
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

const PlayerCard = ({ player, seasonStats, onClick, playerRanks = {} }: PlayerCardProps) => {
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
          <PlayerAvatar name={player.name} image={player.image} size="md" className="border-2 border-accent/30" />
          <div>
            <div className="font-medium text-foreground">{player.name}</div>
            {playerRank && (
              <div className="flex items-center text-xs">
                <Flag className="h-3 w-3 text-draw mr-1" />
                <span className="text-draw">#{playerRank}</span>
              </div>
            )}
            {!playerRank && hasPlayedGames && (
              <div className="flex items-center text-xs">
                <Flag className="h-3 w-3 text-draw mr-1" />
                <span className="text-draw">Not ranked</span>
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
                // Show current season games if available, otherwise show 0 (not total games)
                return seasonStat?.played || 0;
              })()
            }</span>
          </div>
          <div className="stat-item flex flex-col items-center justify-center p-1">
            <span className="text-xs text-muted-foreground">Won</span>
            <span className="font-semibold text-win">{
              (() => {
                const seasonStat = seasonStats.find(stat => stat.playerId === player.id);
                return seasonStat?.wins || 0;
              })()
            }</span>
          </div>
          <div className="stat-item flex flex-col items-center justify-center p-1">
            <span className="text-xs text-muted-foreground">Lost</span>
            <span className="font-semibold text-loss">{
              (() => {
                const seasonStat = seasonStats.find(stat => stat.playerId === player.id);
                return seasonStat?.losses || 0;
              })()
            }</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSelection;
