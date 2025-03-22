
import { useState, useRef, useEffect } from 'react';
import { Player } from "@/types";
import { useToast } from "@/components/ui/use-toast";

type RevealStage = 'idle' | 'flashing' | 'spotlight' | 'revealing' | 'celebration';

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
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [hasStartedRandomization, setHasStartedRandomization] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
  // Log the current stage for debugging
  useEffect(() => {
    console.log(`RevealStage changed to: ${revealStage}`);
  }, [revealStage]);

  // Simple shuffle function to randomize players
  const shufflePlayers = (players: Player[]) => {
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Simplified randomization function with reliable timeouts
  const performRandomization = async (players: Player[]) => {
    if (players.length === 0 || isRandomizing) return;
    
    console.log("Starting randomization process");
    setIsRandomizing(true);
    setHasStartedRandomization(true);
    setAnimationCompleted(false);
    setRevealStage("idle");

    try {
      // Create shuffled teams
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
      
      // STAGE 1: FLASHING
      setRevealStage("flashing");
      console.log("Starting flashing stage");
      
      // Flash for 2 seconds total (10 intervals of 200ms)
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const randomPlayerIds = selectedPlayers
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(selectedPlayers.length / 2));
        setFlashingPlayers(randomPlayerIds);
      }
      
      // Clear flashing effect
      setFlashingPlayers([]);
      
      // STAGE 2: SPOTLIGHT
      setRevealStage("spotlight");
      console.log("Starting spotlight stage");
      
      // Show spotlight for up to 3 star players
      const starPlayerCount = Math.min(3, shuffledPlayers.length);
      const starPlayers = shuffledPlayers.slice(0, starPlayerCount);
      
      for (const player of starPlayers) {
        setSpotlightPlayer(player);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setSpotlightPlayer(null);
      
      // STAGE 3: REVEALING
      console.log("Starting revealing stage");
      setRevealStage("revealing");
      setTeamAPlayers(finalTeamA);
      setTeamBPlayers(finalTeamB);
      
      // Reveal players one by one
      const maxRevealCount = Math.max(finalTeamA.length, finalTeamB.length);
      for (let i = 0; i < maxRevealCount; i++) {
        setRevealIndex(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // STAGE 4: CELEBRATION
      console.log("Starting celebration stage");
      setRevealStage("celebration");
      
      // Show completion for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Complete the animation
      setAnimationCompleted(true);
      
      // Call the callback with the randomized teams
      onRandomize([...finalTeamA, ...finalTeamB], singleTeamSize);
      
      toast({
        title: "Teams Randomized",
        description: `Created balanced ${teamSize}-a-side teams`,
      });
    } catch (error) {
      console.error("Error during randomization:", error);
      resetRandomizer();
      
      toast({
        title: "Randomization Error",
        description: "There was an error during team randomization. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRandomizing(false);
    }
  };

  const resetRandomizer = () => {
    setIsRandomizing(false);
    setFlashingPlayers([]);
    setRevealIndex(-1);
    setRevealStage("idle");
    setSpotlightPlayer(null);
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
    performRandomization,
    resetRandomizer,
    togglePlayerSelection,
    setInitialSelectedPlayers
  };
};
