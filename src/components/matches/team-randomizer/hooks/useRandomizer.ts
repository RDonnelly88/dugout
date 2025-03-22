import { useState, useRef, useEffect } from 'react';
import { Player } from "@/types";
import { useToast } from "@/components/ui/use-toast";

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
  const [spotlightPlayer, setSpotlightPlayer] = useState<Player | null>(null);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Clear any randomization state when component unmounts
  useEffect(() => {
    return () => {
      resetRandomizer();
    };
  }, []);

  // Reset animation completed flag when isRandomizing changes to true
  useEffect(() => {
    if (isRandomizing) {
      setAnimationCompleted(false);
    }
  }, [isRandomizing]);

  const shufflePlayers = (players: Player[]) => {
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const performRandomization = async (players: Player[]) => {
    if (players.length === 0) return;
    
    console.log("Starting randomization with stages");
    setIsRandomizing(true);
    setAnimationCompleted(false);
    setRevealStage("flashing");
    setRevealIndex(-1);
    
    // STAGE 1: FLASHING - Dramatic flashing animation
    console.log("Starting flashing stage");
    let flashInterval: NodeJS.Timeout;
    
    // Create a Promise that resolves after the flashing animation completes
    await new Promise<void>(resolve => {
      // Start the flashing animation
      flashInterval = setInterval(() => {
        const availablePlayerIds = selectedPlayers;
        const randomPlayerIds = availablePlayerIds
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(availablePlayerIds.length / 2));
        
        setFlashingPlayers(randomPlayerIds);
      }, 200);
      
      // Wait for 3 seconds, then clean up and move to next stage
      setTimeout(() => {
        clearInterval(flashInterval);
        resolve();
      }, 3000);
    });
    
    // STAGE 2: SPOTLIGHT - Dramatic Spotlight Phase
    console.log("Moving to spotlight stage");
    setRevealStage("spotlight");
    setFlashingPlayers([]);
    
    // Prepare the randomized teams
    const shuffledPlayers = shufflePlayers(players);
    
    const singleTeamSize = parseInt(teamSize);
    const totalPlayersNeeded = singleTeamSize * 2;
    
    const cappedPlayerCount = Math.min(shuffledPlayers.length, totalPlayersNeeded);
    const adjustedPlayerCount = cappedPlayerCount % 2 === 0 ? 
      cappedPlayerCount : 
      cappedPlayerCount - 1;
    
    const teamASize = Math.floor(adjustedPlayerCount / 2);
    const finalTeamA = shuffledPlayers.slice(0, teamASize);
    const finalTeamB = shuffledPlayers.slice(teamASize, teamASize * 2);
    
    // Show spotlight for several star players
    const starPlayers = [...shuffledPlayers].sort(() => Math.random() - 0.5).slice(0, Math.min(3, shuffledPlayers.length));
    
    for (const player of starPlayers) {
      setSpotlightPlayer(player);
      console.log("Spotlight on player:", player.name);
      // Wait for 1.5 seconds between each spotlight
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setSpotlightPlayer(null);
    
    // STAGE 3: REVEALING - Team Reveal Phase
    console.log("Moving to revealing stage");
    setRevealStage("revealing");
    setTeamAPlayers(finalTeamA);
    setTeamBPlayers(finalTeamB);
    
    // Brief pause before starting the reveal
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reveal players one by one with dramatic effect
    const maxRevealCount = Math.max(finalTeamA.length, finalTeamB.length);
    for (let i = 0; i < maxRevealCount; i++) {
      setRevealIndex(i);
      console.log(`Revealing player at index ${i}`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // STAGE 4: CELEBRATION - Final celebration stage
    console.log("Moving to celebration stage");
    setRevealStage("celebration");
    
    // Keep the final result visible for celebration moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Animation is completed
    setAnimationCompleted(true);
    
    // Call the callback with the randomized players
    const allRandomizedPlayers = [...finalTeamA, ...finalTeamB];
    onRandomize(allRandomizedPlayers, singleTeamSize);
    
    toast({
      title: "Teams Randomized",
      description: `Created balanced ${teamSize}-a-side teams`,
    });
  };

  const resetRandomizer = () => {
    setIsRandomizing(false);
    setFlashingPlayers([]);
    setRevealIndex(-1);
    setRevealStage("idle");
    setSpotlightPlayer(null);
    setAnimationCompleted(false);
    
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
    performRandomization,
    resetRandomizer,
    togglePlayerSelection,
    setInitialSelectedPlayers
  };
};
