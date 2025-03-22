
import { useState, useRef, useEffect } from 'react';
import { Player } from "@/types";
import { PositionType, FormationConfig } from '../types';
import { formationConfigs, linePositions } from '../constants';

export const useRandomizer = (onRandomize: (players: Player[], teamSize: number) => void) => {
  const [teamSize, setTeamSize] = useState<string>("5");
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [randomizingPlayers, setRandomizingPlayers] = useState<Player[]>([]);
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
  const [assignedPositions, setAssignedPositions] = useState<Record<string, PositionType>>({});
  const [spotlightPlayer, setSpotlightPlayer] = useState<Player | null>(null);
  const [revealComplete, setRevealComplete] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [formationView, setFormationView] = useState(false);
  const [revealStage, setRevealStage] = useState<string>("shuffling");
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

  const assignPositions = (players: Player[]) => {
    // Create a mapping of player IDs to 'formation-player' position type
    const positionMap: Record<string, PositionType> = {};
    players.forEach((player) => {
      positionMap[player.id] = 'formation-player';
    });
    
    return positionMap;
  };

  const performDramaticRandomization = async (players: Player[]) => {
    if (players.length === 0) return;
    
    // Reset all state
    setIsRandomizing(true);
    setRevealComplete(false);
    setRevealIndex(-1);
    setSpotlightPlayer(null);
    setFormationView(false);
    setRevealStage("shuffling");
    
    // Create and play audio
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
    
    // Set all randomized players for shuffling animation
    setRandomizingPlayers(shuffledPlayers.slice(0, Math.min(8, adjustedPlayerCount)));
    
    // Create positions mapping for all players
    const allRandomizedPlayers = shuffledPlayers.slice(0, adjustedPlayerCount);
    const positions = assignPositions(allRandomizedPlayers);
    setAssignedPositions(positions);
    
    // Start with empty teams
    setTeamAPlayers([]);
    setTeamBPlayers([]);
    
    // STAGE 1: Shuffling animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // STAGE 2: Spotlight reveal of selected players one by one
    setRevealStage("spotlight");
    
    // Show each player in spotlight briefly before assigning to teams
    for (let i = 0; i < allRandomizedPlayers.length; i++) {
      setSpotlightPlayer(allRandomizedPlayers[i]);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    setSpotlightPlayer(null);
    
    // STAGE 3: Assign players to teams alternately
    setRevealStage("assigning");
    
    // Pre-set the final teams so we can reveal them one by one
    setTeamAPlayers(finalTeamA);
    setTeamBPlayers(finalTeamB);
    
    // Reveal players one by one, alternating between teams
    const maxTeamSize = Math.max(finalTeamA.length, finalTeamB.length);
    
    for (let i = 0; i < maxTeamSize; i++) {
      setRevealIndex(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // STAGE 4: Show final teams in a nice formation
    setFormationView(true);
    setRevealComplete(true);
    
    // Fade out the audio
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
    
    // Final pause to see the results
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Reset state and call the actual randomize function
    setIsRandomizing(false);
    setRandomizingPlayers([]);
    setRevealIndex(-1);
    setSpotlightPlayer(null);
    setFormationView(false);
    setRevealStage("shuffling");
    
    // Call the actual randomize function with all players
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
    randomizingPlayers,
    teamAPlayers,
    teamBPlayers,
    assignedPositions,
    spotlightPlayer,
    revealComplete,
    revealIndex,
    formationView,
    revealStage,
    audioRef,
    performDramaticRandomization,
    togglePlayerSelection,
    setInitialSelectedPlayers
  };
};
