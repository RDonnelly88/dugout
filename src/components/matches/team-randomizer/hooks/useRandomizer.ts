
import { useState, useRef, useEffect } from 'react';
import { Player } from "@/types";
import { PositionType } from '../types';

export const useRandomizer = (onRandomize: (players: Player[], teamSize: number) => void) => {
  const [teamSize, setTeamSize] = useState<string>("5");
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [flashingPlayers, setFlashingPlayers] = useState<string[]>([]);
  const [revealStage, setRevealStage] = useState<string>("idle");
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
  const [revealIndex, setRevealIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const shufflePlayers = (players: Player[]) => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const performRandomization = async (players: Player[]) => {
    if (players.length === 0) return;
    
    // Reset all state
    setIsRandomizing(true);
    setRevealStage("flashing");
    setRevealIndex(-1);
    
    // Start audio
    if (!audioRef.current) {
      audioRef.current = new Audio("/randomizer-sound.mp3");
      audioRef.current.volume = 0.5;
      audioRef.current.loop = true;
    }
    
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    } catch (error) {
      console.error("Audio error:", error);
    }
    
    // STAGE 1: Flash players for 3 seconds
    const flashInterval = setInterval(() => {
      const availablePlayerIds = selectedPlayers;
      const randomPlayerIds = availablePlayerIds
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(availablePlayerIds.length / 2));
      
      setFlashingPlayers(randomPlayerIds);
    }, 200);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    clearInterval(flashInterval);
    
    // Get filtered players and shuffle them
    const playersForRandomization = players;
    const shuffledPlayers = shufflePlayers(playersForRandomization);
    
    // Determine how many players per team
    const singleTeamSize = parseInt(teamSize);
    const totalPlayersNeeded = singleTeamSize * 2;
    
    // Cap to available players, ensuring even distribution
    const cappedPlayerCount = Math.min(shuffledPlayers.length, totalPlayersNeeded);
    // Make sure we have an even number to split evenly
    const adjustedPlayerCount = cappedPlayerCount % 2 === 0 ? 
      cappedPlayerCount : 
      cappedPlayerCount - 1;
    
    // Split players into two teams
    const teamASize = Math.floor(adjustedPlayerCount / 2);
    const finalTeamA = shuffledPlayers.slice(0, teamASize);
    const finalTeamB = shuffledPlayers.slice(teamASize, teamASize * 2);
    
    // STAGE 2: Reveal teams
    setRevealStage("revealing");
    setTeamAPlayers(finalTeamA);
    setTeamBPlayers(finalTeamB);
    
    // Reveal players one by one
    const maxRevealCount = Math.max(finalTeamA.length, finalTeamB.length);
    for (let i = 0; i < maxRevealCount; i++) {
      setRevealIndex(i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Fade out audio
    if (audioRef.current) {
      const fadeOut = () => {
        if (audioRef.current && audioRef.current.volume > 0.05) {
          audioRef.current.volume -= 0.05;
          setTimeout(fadeOut, 100);
        } else if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
      fadeOut();
    }
    
    // Wait for 2 seconds to see the final result
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset state and call the actual randomize function
    setIsRandomizing(false);
    setFlashingPlayers([]);
    setRevealIndex(-1);
    setRevealStage("idle");
    
    // Call the actual randomize function with all players
    const allRandomizedPlayers = [...finalTeamA, ...finalTeamB];
    onRandomize(allRandomizedPlayers, singleTeamSize);
  };

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const setInitialSelectedPlayers = (players: Player[]) => {
    setSelectedPlayers(players.map(p => p.id));
  };

  return {
    teamSize,
    setTeamSize,
    showPlayerSelection,
    setShowPlayerSelection,
    selectedPlayers,
    setSelectedPlayers,
    isRandomizing,
    flashingPlayers,
    revealStage,
    teamAPlayers,
    teamBPlayers,
    revealIndex,
    audioRef,
    performRandomization,
    togglePlayerSelection,
    setInitialSelectedPlayers
  };
};
