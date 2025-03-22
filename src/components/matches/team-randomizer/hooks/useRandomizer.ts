
import { useState, useRef, useEffect } from 'react';
import { Player } from "@/types";
import { PositionType } from '../types';
import { formationPositions, linePositions } from '../constants';

export const useRandomizer = (onRandomize: (players: Player[], teamSize: number) => void) => {
  const [teamSize, setTeamSize] = useState<string>("5");
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [randomizingPlayers, setRandomizingPlayers] = useState<Player[]>([]);
  const [assignedPositions, setAssignedPositions] = useState<Record<string, PositionType>>({});
  const [spotlightPlayer, setSpotlightPlayer] = useState<Player | null>(null);
  const [revealComplete, setRevealComplete] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [formationView, setFormationView] = useState(false);
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

  const assignPositions = (players: Player[], teamSize: string) => {
    // Get the positions for the selected team size using linePositions instead of formationPositions
    const positions = linePositions[teamSize] || linePositions["5"];
    
    // Cap the number of players to the available positions
    const cappedPlayers = players.slice(0, positions.length);
    
    // Create a mapping of player IDs to positions
    const positionMap: Record<string, PositionType> = {};
    cappedPlayers.forEach((player, index) => {
      if (index < positions.length) {
        positionMap[player.id] = positions[index];
      }
    });
    
    return positionMap;
  };

  const performDramaticRandomization = async (players: Player[]) => {
    if (players.length === 0) return;
    
    setIsRandomizing(true);
    setRevealComplete(false);
    setRevealIndex(-1);
    setSpotlightPlayer(null);
    setFormationView(false);
    
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
    
    // Assign positions to players - only for visualization purposes
    // We'll only visualize the first team's worth of players
    const singleTeamSize = parseInt(teamSize);
    const visualizationPlayers = shuffledPlayers.slice(0, singleTeamSize);
    const positions = assignPositions(visualizationPlayers, teamSize);
    setAssignedPositions(positions);
    
    // Set the randomizing players - only showing the first team for the animation
    setRandomizingPlayers(visualizationPlayers);
    
    // Dramatic pause before starting
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Loop through each player and spotlight them
    for (let i = 0; i < visualizationPlayers.length; i++) {
      // Skip if we've assigned enough players already
      if (i >= Object.keys(positions).length) break;
      
      // Set current player in spotlight
      setSpotlightPlayer(visualizationPlayers[i]);
      
      // Wait for dramatic effect (longer for first players)
      const spotlightDuration = i === 0 ? 3500 : 3000;
      await new Promise(resolve => setTimeout(resolve, spotlightDuration));
      
      // Add to revealed players
      setRevealIndex(i);
      setSpotlightPlayer(null);
      
      // Pause between reveals
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Show the formation view (now a line view)
    setFormationView(true);
    
    // Longer pause to view the final formation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mark complete
    setRevealComplete(true);
    
    // Stop the audio
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
    
    // Call the actual randomize function with players for both teams
    // This is the key change - we're using the full set of shuffled players for both teams
    const teamsCount = 2; // We want to create two teams
    const totalPlayersNeeded = parseInt(teamSize) * teamsCount;
    const finalPlayers = shuffledPlayers.slice(0, totalPlayersNeeded);
    onRandomize(finalPlayers, parseInt(teamSize));
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
    assignedPositions,
    spotlightPlayer,
    revealComplete,
    revealIndex,
    formationView,
    audioRef,
    performDramaticRandomization,
    togglePlayerSelection,
    setInitialSelectedPlayers
  };
};
