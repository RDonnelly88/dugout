
import { useState, useRef, useEffect } from 'react';
import { Player } from "@/types";
import { useToast } from "@/hooks/use-toast";

type RevealStage = 'idle' | 'player-selection' | 'flashing' | 'spotlight' | 'revealing' | 'celebration';

export const useRandomizer = (onRandomize: (players: Player[], teamSize: number) => void) => {
  const [teamSize, setTeamSize] = useState<string>("5");
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [flashingPlayers, setFlashingPlayers] = useState<string[]>([]);
  const [revealStage, setRevealStage] = useState<RevealStage>("idle");
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [spotlightPlayer, setSpotlightPlayer] = useState<Player | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [hasStartedRandomization, setHasStartedRandomization] = useState(false);
  const [shuffledPlayers, setShuffledPlayers] = useState<Player[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
  // Track timeouts to clear if needed
  const timeoutRefs = useRef<number[]>([]);

  // Clear all timeouts when component unmounts or reset is called
  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(timeoutId => window.clearTimeout(timeoutId));
    timeoutRefs.current = [];
  };

  // Log the current stage for debugging
  useEffect(() => {
    console.log(`RevealStage changed to: ${revealStage}`);
  }, [revealStage]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Simple shuffle function to randomize players
  const shufflePlayers = (players: Player[]) => {
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Prepare the randomization but don't run the animation yet
  const prepareRandomization = (players: Player[]) => {
    console.log("Preparing randomization with", players.length, "players");
    
    if (players.length < 2) {
      console.log("Not enough players selected");
      toast({
        title: "Not enough players",
        description: "Please select at least 2 players for randomization",
        variant: "destructive"
      });
      return;
    }
    
    if (isRandomizing) {
      console.log("Already randomizing, ignoring request");
      return;
    }
    
    setIsRandomizing(true);
    setHasStartedRandomization(true);
    setAnimationCompleted(false);
    
    // Clear any existing timeouts
    clearAllTimeouts();

    try {
      // Create shuffled teams
      const shuffled = shufflePlayers(players);
      setShuffledPlayers(shuffled);
      
      const singleTeamSize = parseInt(teamSize);
      const totalPlayersNeeded = singleTeamSize * 2;
      
      const cappedPlayerCount = Math.min(shuffled.length, totalPlayersNeeded);
      const adjustedPlayerCount = cappedPlayerCount % 2 === 0 ? 
        cappedPlayerCount : 
        cappedPlayerCount - 1;
      
      const teamASize = Math.floor(adjustedPlayerCount / 2);
      const finalTeamA = shuffled.slice(0, teamASize);
      const finalTeamB = shuffled.slice(teamASize, teamASize * 2);
      
      // Set the teams (but we won't reveal them yet)
      setTeamAPlayers(finalTeamA);
      setTeamBPlayers(finalTeamB);
      
      // Move to player selection stage first
      setRevealStage("player-selection");
      
    } catch (error) {
      console.error("Error during randomization preparation:", error);
      resetRandomizer();
      
      toast({
        title: "Randomization Error",
        description: "There was an error preparing the team randomization. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Step 1: Start the flashing animation
  const startFlashingStage = () => {
    console.log("Starting flashing stage");
    setRevealStage("flashing");
    
    // Just trigger some random flashing for effect
    const randomPlayerIds = selectedPlayers
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(selectedPlayers.length / 2));
    setFlashingPlayers(randomPlayerIds);
  };
  
  // Step 2: Show spotlight players
  const startSpotlightStage = () => {
    console.log("Starting spotlight stage");
    setFlashingPlayers([]);
    setRevealStage("spotlight");
    setSpotlightIndex(0);
    
    if (shuffledPlayers.length > 0) {
      setSpotlightPlayer(shuffledPlayers[0]);
    }
  };
  
  // Step 2b: Show next spotlight player or move to next stage
  const showNextSpotlightPlayer = () => {
    const nextIndex = spotlightIndex + 1;
    const maxSpotlightPlayers = Math.min(3, shuffledPlayers.length);
    
    if (nextIndex < maxSpotlightPlayers) {
      console.log(`Showing spotlight player ${nextIndex + 1}`);
      setSpotlightIndex(nextIndex);
      setSpotlightPlayer(shuffledPlayers[nextIndex]);
    } else {
      // Move to revealing stage
      startRevealingStage();
    }
  };
  
  // Step 3: Reveal teams
  const startRevealingStage = () => {
    console.log("Starting revealing stage");
    setSpotlightPlayer(null);
    setRevealStage("revealing");
    setRevealIndex(0);
  };
  
  // Step 3b: Reveal next player or move to next stage
  const revealNextPlayer = () => {
    const maxRevealCount = Math.max(teamAPlayers.length, teamBPlayers.length);
    const nextIndex = revealIndex + 1;
    
    if (nextIndex < maxRevealCount) {
      console.log(`Revealing player ${nextIndex + 1}`);
      setRevealIndex(nextIndex);
    } else {
      // Move to celebration stage
      startCelebrationStage();
    }
  };
  
  // Step 4: Celebration and completion
  const startCelebrationStage = () => {
    console.log("Starting celebration stage");
    setRevealStage("celebration");
  };
  
  // Step 5: Complete the randomization
  const completeRandomization = () => {
    console.log("Completing randomization");
    setAnimationCompleted(true);
    setIsRandomizing(false);
    
    // Call the callback with the randomized teams
    const singleTeamSize = parseInt(teamSize);
    onRandomize([...teamAPlayers, ...teamBPlayers], singleTeamSize);
    
    toast({
      title: "Teams Randomized",
      description: `Created balanced ${teamSize}-a-side teams`,
    });
  };

  const resetRandomizer = () => {
    console.log("Resetting randomizer");
    clearAllTimeouts();
    setIsRandomizing(false);
    setFlashingPlayers([]);
    setRevealIndex(-1);
    setRevealStage("idle");
    setSpotlightPlayer(null);
    setSpotlightIndex(0);
    setAnimationCompleted(false);
    setHasStartedRandomization(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
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
    spotlightPlayer,
    audioRef,
    animationCompleted,
    hasStartedRandomization,
    prepareRandomization,
    startFlashingStage,
    startSpotlightStage,
    showNextSpotlightPlayer,
    startRevealingStage,
    revealNextPlayer,
    startCelebrationStage,
    completeRandomization,
    resetRandomizer,
    togglePlayerSelection,
    setInitialSelectedPlayers
  };
};
