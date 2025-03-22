
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
  
  // Track timeouts so they can be cleared if needed
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

  // Simplified randomization function with reliable timeouts
  const performRandomization = async (players: Player[]) => {
    if (players.length === 0) {
      console.log("No players selected, can't randomize");
      toast({
        title: "No players available",
        description: "Please select players for randomization",
        variant: "destructive"
      });
      return;
    }
    
    if (isRandomizing) {
      console.log("Already randomizing, ignoring request");
      return;
    }
    
    console.log("Starting randomization process with", players.length, "players");
    setIsRandomizing(true);
    setHasStartedRandomization(true);
    setAnimationCompleted(false);
    setRevealStage("idle");
    
    // Clear any existing timeouts
    clearAllTimeouts();

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
      
      // Use a more reliable approach than async/await with setTimeout
      // STAGE 1: FLASHING
      console.log("Scheduling flashing stage");
      setRevealStage("flashing");
      
      // Schedule the flashing sequence
      let flashCounter = 0;
      const flashInterval = window.setInterval(() => {
        const randomPlayerIds = selectedPlayers
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(selectedPlayers.length / 2));
        setFlashingPlayers(randomPlayerIds);
        
        flashCounter++;
        if (flashCounter >= 10) {
          clearInterval(flashInterval);
          setFlashingPlayers([]);
          
          // Move to spotlight stage
          console.log("Flashing completed, moving to spotlight");
          setRevealStage("spotlight");
          
          // STAGE 2: SPOTLIGHT
          // Show each spotlight player with delay
          const spotlightTimeout = window.setTimeout(() => {
            const starPlayerCount = Math.min(3, shuffledPlayers.length);
            let spotlightIndex = 0;
            
            const showNextSpotlight = () => {
              if (spotlightIndex < starPlayerCount) {
                setSpotlightPlayer(shuffledPlayers[spotlightIndex]);
                spotlightIndex++;
                
                const nextSpotlightTimeout = window.setTimeout(() => {
                  showNextSpotlight();
                }, 1000);
                
                timeoutRefs.current.push(nextSpotlightTimeout);
              } else {
                // Move to revealing stage
                setSpotlightPlayer(null);
                console.log("Spotlight completed, moving to revealing stage");
                setRevealStage("revealing");
                setTeamAPlayers(finalTeamA);
                setTeamBPlayers(finalTeamB);
                
                // STAGE 3: REVEALING
                // Reveal players one by one
                let currentRevealIndex = 0;
                const maxRevealCount = Math.max(finalTeamA.length, finalTeamB.length);
                
                const revealNextPlayer = () => {
                  if (currentRevealIndex < maxRevealCount) {
                    setRevealIndex(currentRevealIndex);
                    currentRevealIndex++;
                    
                    const nextRevealTimeout = window.setTimeout(() => {
                      revealNextPlayer();
                    }, 300);
                    
                    timeoutRefs.current.push(nextRevealTimeout);
                  } else {
                    // Move to celebration stage
                    console.log("Revealing completed, moving to celebration stage");
                    setRevealStage("celebration");
                    
                    // STAGE 4: CELEBRATION
                    const celebrationTimeout = window.setTimeout(() => {
                      console.log("Celebration completed, finalizing animation");
                      setAnimationCompleted(true);
                      setIsRandomizing(false);
                      
                      // Call the callback with the randomized teams
                      onRandomize([...finalTeamA, ...finalTeamB], singleTeamSize);
                      
                      toast({
                        title: "Teams Randomized",
                        description: `Created balanced ${teamSize}-a-side teams`,
                      });
                    }, 2000);
                    
                    timeoutRefs.current.push(celebrationTimeout);
                  }
                };
                
                // Start revealing players
                revealNextPlayer();
              }
            };
            
            // Start spotlight sequence
            showNextSpotlight();
          }, 500);
          
          timeoutRefs.current.push(spotlightTimeout);
        }
      }, 200);
      
      // Store the interval ID to clear if needed
      // We need to convert the interval to a number to match our timeoutRefs type
      timeoutRefs.current.push(Number(flashInterval));
      
    } catch (error) {
      console.error("Error during randomization:", error);
      resetRandomizer();
      
      toast({
        title: "Randomization Error",
        description: "There was an error during team randomization. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetRandomizer = () => {
    console.log("Resetting randomizer");
    clearAllTimeouts();
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
