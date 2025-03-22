
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMatches, getPlayer } from "@/lib/db";
import { Match, Player } from "@/types";

interface PlayerRelationship {
  playerId: string;
  playerName: string;
  playerImage?: string;
  matchesWithSameTeam: number;
  winsWithSameTeam: number;
  matchesPlayed: number;
  winRateWithSameTeam: number;
  matchesAsOpponent: number;
  winsAgainst: number;
  lossesAgainst: number;
  winRateAgainst: number;
}

export interface PlayerRelationshipsStats {
  bestTeammate?: PlayerRelationship;
  worstTeammate?: PlayerRelationship;
  mostFrequentTeammate?: PlayerRelationship;
  toughestOpponent?: PlayerRelationship;
  easiestOpponent?: PlayerRelationship;
  bySeasonId?: Record<string, {
    bestTeammate?: PlayerRelationship;
    worstTeammate?: PlayerRelationship;
    mostFrequentTeammate?: PlayerRelationship;
    toughestOpponent?: PlayerRelationship;
    easiestOpponent?: PlayerRelationship;
  }>;
}

export const usePlayerRelationships = (playerId: string) => {
  const [relationships, setRelationships] = useState<Record<string, PlayerRelationship>>({});
  const [stats, setStats] = useState<PlayerRelationshipsStats>({});

  // Get all matches
  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches
  });

  // Get the player
  const { data: player, isLoading: isLoadingPlayer } = useQuery({
    queryKey: ['player', playerId],
    queryFn: () => getPlayer(playerId),
    enabled: !!playerId
  });

  // Process matches to extract relationships data
  useEffect(() => {
    if (!playerId || !matches.length || isLoadingMatches || isLoadingPlayer) return;

    const processMatches = async () => {
      const playerRelationships: Record<string, PlayerRelationship> = {};
      const bySeasonId: Record<string, Record<string, PlayerRelationship>> = {};
      
      // Process all completed matches
      for (const match of matches.filter(m => m.status === 'completed' && 
                                         (m.teamA.players.includes(playerId) || 
                                          m.teamB.players.includes(playerId)))) {
        const playerInTeamA = match.teamA.players.includes(playerId);
        const playerTeam = playerInTeamA ? match.teamA : match.teamB;
        const opposingTeam = playerInTeamA ? match.teamB : match.teamA;
        const playerTeamWon = match.teamA.score !== undefined && match.teamB.score !== undefined && 
                             ((playerInTeamA && match.teamA.score > match.teamB.score) || 
                              (!playerInTeamA && match.teamB.score > match.teamA.score));
        const isDraw = match.teamA.score !== undefined && match.teamB.score !== undefined && 
                      match.teamA.score === match.teamB.score;
        
        // Initialize season data if it doesn't exist
        if (match.seasonId && !bySeasonId[match.seasonId]) {
          bySeasonId[match.seasonId] = {};
        }
        
        // Process teammates
        for (const teammateId of playerTeam.players) {
          if (teammateId === playerId) continue;
          
          // Initialize teammate data if it doesn't exist
          if (!playerRelationships[teammateId]) {
            // Get player details
            const teammatePlayer = await getPlayer(teammateId);
            if (!teammatePlayer) continue;
            
            playerRelationships[teammateId] = {
              playerId: teammateId,
              playerName: teammatePlayer.name,
              playerImage: teammatePlayer.image,
              matchesWithSameTeam: 0,
              winsWithSameTeam: 0,
              matchesPlayed: 0,
              winRateWithSameTeam: 0,
              matchesAsOpponent: 0,
              winsAgainst: 0,
              lossesAgainst: 0,
              winRateAgainst: 0
            };
          }
          
          // Update teammate stats
          playerRelationships[teammateId].matchesWithSameTeam++;
          playerRelationships[teammateId].matchesPlayed++;
          if (playerTeamWon) {
            playerRelationships[teammateId].winsWithSameTeam++;
          }
          playerRelationships[teammateId].winRateWithSameTeam = 
            playerRelationships[teammateId].winsWithSameTeam / playerRelationships[teammateId].matchesWithSameTeam;
          
          // Update teammate stats for this season
          if (match.seasonId) {
            if (!bySeasonId[match.seasonId][teammateId]) {
              bySeasonId[match.seasonId][teammateId] = { ...playerRelationships[teammateId], matchesWithSameTeam: 0, winsWithSameTeam: 0, winRateWithSameTeam: 0 };
            }
            
            bySeasonId[match.seasonId][teammateId].matchesWithSameTeam++;
            if (playerTeamWon) {
              bySeasonId[match.seasonId][teammateId].winsWithSameTeam++;
            }
            bySeasonId[match.seasonId][teammateId].winRateWithSameTeam = 
              bySeasonId[match.seasonId][teammateId].winsWithSameTeam / bySeasonId[match.seasonId][teammateId].matchesWithSameTeam;
          }
        }
        
        // Process opponents
        for (const opponentId of opposingTeam.players) {
          // Initialize opponent data if it doesn't exist
          if (!playerRelationships[opponentId]) {
            // Get player details
            const opponentPlayer = await getPlayer(opponentId);
            if (!opponentPlayer) continue;
            
            playerRelationships[opponentId] = {
              playerId: opponentId,
              playerName: opponentPlayer.name,
              playerImage: opponentPlayer.image,
              matchesWithSameTeam: 0,
              winsWithSameTeam: 0,
              matchesPlayed: 0,
              winRateWithSameTeam: 0,
              matchesAsOpponent: 0,
              winsAgainst: 0,
              lossesAgainst: 0,
              winRateAgainst: 0
            };
          }
          
          // Update opponent stats
          playerRelationships[opponentId].matchesAsOpponent++;
          playerRelationships[opponentId].matchesPlayed++;
          if (playerTeamWon && !isDraw) {
            playerRelationships[opponentId].winsAgainst++;
          } else if (!isDraw) {
            playerRelationships[opponentId].lossesAgainst++;
          }
          
          playerRelationships[opponentId].winRateAgainst = 
            playerRelationships[opponentId].matchesAsOpponent > 0 ? 
            playerRelationships[opponentId].winsAgainst / playerRelationships[opponentId].matchesAsOpponent : 0;
          
          // Update opponent stats for this season
          if (match.seasonId) {
            if (!bySeasonId[match.seasonId][opponentId]) {
              bySeasonId[match.seasonId][opponentId] = { ...playerRelationships[opponentId], matchesAsOpponent: 0, winsAgainst: 0, lossesAgainst: 0, winRateAgainst: 0 };
            }
            
            bySeasonId[match.seasonId][opponentId].matchesAsOpponent++;
            if (playerTeamWon && !isDraw) {
              bySeasonId[match.seasonId][opponentId].winsAgainst++;
            } else if (!isDraw) {
              bySeasonId[match.seasonId][opponentId].lossesAgainst++;
            }
            
            bySeasonId[match.seasonId][opponentId].winRateAgainst = 
              bySeasonId[match.seasonId][opponentId].matchesAsOpponent > 0 ? 
              bySeasonId[match.seasonId][opponentId].winsAgainst / bySeasonId[match.seasonId][opponentId].matchesAsOpponent : 0;
          }
        }
      }
      
      // Calculate overall stats
      const relationshipsArray = Object.values(playerRelationships);
      
      // Best teammate (highest win rate with, min 2 matches)
      const bestTeammate = relationshipsArray
        .filter(r => r.matchesWithSameTeam >= 2)
        .sort((a, b) => b.winRateWithSameTeam - a.winRateWithSameTeam)[0];
      
      // Worst teammate (lowest win rate with, min 2 matches)
      const worstTeammate = relationshipsArray
        .filter(r => r.matchesWithSameTeam >= 2)
        .sort((a, b) => a.winRateWithSameTeam - b.winRateWithSameTeam)[0];
      
      // Most frequent teammate
      const mostFrequentTeammate = relationshipsArray
        .sort((a, b) => b.matchesWithSameTeam - a.matchesWithSameTeam)[0];
      
      // Toughest opponent (lowest win rate against them, min 2 matches)
      const toughestOpponent = relationshipsArray
        .filter(r => r.matchesAsOpponent >= 2)
        .sort((a, b) => a.winRateAgainst - b.winRateAgainst)[0];
      
      // Easiest opponent (highest win rate against them, min 2 matches)
      const easiestOpponent = relationshipsArray
        .filter(r => r.matchesAsOpponent >= 2)
        .sort((a, b) => b.winRateAgainst - a.winRateAgainst)[0];
      
      // Calculate per-season stats
      const bySeasonStats: Record<string, {
        bestTeammate?: PlayerRelationship;
        worstTeammate?: PlayerRelationship;
        mostFrequentTeammate?: PlayerRelationship;
        toughestOpponent?: PlayerRelationship;
        easiestOpponent?: PlayerRelationship;
      }> = {};
      
      for (const seasonId in bySeasonId) {
        const seasonRelationships = Object.values(bySeasonId[seasonId]);
        
        bySeasonStats[seasonId] = {
          bestTeammate: seasonRelationships
            .filter(r => r.matchesWithSameTeam >= 2)
            .sort((a, b) => b.winRateWithSameTeam - a.winRateWithSameTeam)[0],
          
          worstTeammate: seasonRelationships
            .filter(r => r.matchesWithSameTeam >= 2)
            .sort((a, b) => a.winRateWithSameTeam - b.winRateWithSameTeam)[0],
          
          mostFrequentTeammate: seasonRelationships
            .sort((a, b) => b.matchesWithSameTeam - a.matchesWithSameTeam)[0],
          
          toughestOpponent: seasonRelationships
            .filter(r => r.matchesAsOpponent >= 2)
            .sort((a, b) => a.winRateAgainst - b.winRateAgainst)[0],
          
          easiestOpponent: seasonRelationships
            .filter(r => r.matchesAsOpponent >= 2)
            .sort((a, b) => b.winRateAgainst - a.winRateAgainst)[0]
        };
      }
      
      setRelationships(playerRelationships);
      setStats({
        bestTeammate,
        worstTeammate,
        mostFrequentTeammate,
        toughestOpponent,
        easiestOpponent,
        bySeasonId: bySeasonStats
      });
    };
    
    processMatches();
  }, [playerId, matches, isLoadingMatches, isLoadingPlayer]);
  
  return {
    relationships,
    stats,
    isLoading: isLoadingMatches || isLoadingPlayer
  };
};
