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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Clear any randomization state when component unmounts
  useEffect(() => {
    return () => {
      resetRandomizer();
    };
  }, []);

  // Always reset state when isRandomizing changes to false
  useEffect(() => {
    if (!isRandomizing) {
      // Don't reset the teams immediately as we want to show them briefly in the modal
      // Other state like flashing and sound should be reset
      setFlashingPlayers([]);
      setSpotlightPlayer(null);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
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
  
  // Simplified version that doesn't depend on sound files
  const performRandomization = async (players: Player[]) => {
    if (players.length === 0) return;
    
    console.log("Starting randomization with stages");
    setIsRandomizing(true);
    setRevealStage("flashing");
    setRevealIndex(-1);
    
    // STAGE 1: FLASHING - Dramatic flashing animation
    console.log("Starting flashing stage");
    const flashDuration = 3000; // 3 seconds
    const flashInterval = setInterval(() => {
      const availablePlayerIds = selectedPlayers;
      const randomPlayerIds = availablePlayerIds
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(availablePlayerIds.length / 2));
      
      setFlashingPlayers(randomPlayerIds);
    }, 200);
    
    // Wait for flashing animation to complete
    await new Promise(resolve => setTimeout(resolve, flashDuration));
    clearInterval(flashInterval);
    
    // STAGE 2: SPOTLIGHT - Dramatic Spotlight Phase
    console.log("Moving to spotlight stage");
    setRevealStage("spotlight");
    
    // Prepare the randomized teams
    const playersForRandomization = players;
    const shuffledPlayers = shufflePlayers(playersForRandomization);
    
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
    const starPlayers = [...shuffledPlayers].sort(() => Math.random() - 0.5).slice(0, 3);
    
    for (const player of starPlayers) {
      setSpotlightPlayer(player);
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
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // STAGE 4: CELEBRATION - Final celebration stage
    console.log("Moving to celebration stage");
    setRevealStage("celebration");
    
    // Keep the final result visible for celebration moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Set randomizing to false but keep teams visible
    setIsRandomizing(false);
    
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
    performRandomization,
    resetRandomizer,
    togglePlayerSelection,
    setInitialSelectedPlayers
  };
};
