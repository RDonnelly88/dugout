import { useState, useRef, useEffect } from 'react';
import { Player } from "@/types";

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

  const performRandomization = async (players: Player[]) => {
    if (players.length === 0) return;
    
    setIsRandomizing(true);
    setRevealStage("flashing");
    setRevealIndex(-1);
    
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
    
    // Dramatic flashing animation
    const flashInterval = setInterval(() => {
      const availablePlayerIds = selectedPlayers;
      const randomPlayerIds = availablePlayerIds
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(availablePlayerIds.length / 2));
      
      setFlashingPlayers(randomPlayerIds);
    }, 200);
    
    // Flashing animation for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 3000));
    clearInterval(flashInterval);
    
    // LOOT BOX REVEAL: Dramatic Spotlight Phase
    setRevealStage("spotlight");
    
    // Get the player list ready
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
    
    // Show spotlight for several star players with dramatic pauses
    const starPlayers = [...shuffledPlayers].sort(() => Math.random() - 0.5).slice(0, 3);
    
    for (const player of starPlayers) {
      setSpotlightPlayer(player);
      // Add dramatic sound effect for each spotlight player
      try {
        const spotlightSound = new Audio("/spotlight-sound.mp3");
        spotlightSound.volume = 0.6;
        spotlightSound.play().catch(e => console.error("Spotlight audio failed:", e));
      } catch (error) {
        console.error("Spotlight audio error:", error);
      }
      await new Promise(resolve => setTimeout(resolve, 1800));
    }
    
    setSpotlightPlayer(null);
    
    // Now start the team reveal phase
    setRevealStage("revealing");
    setTeamAPlayers(finalTeamA);
    setTeamBPlayers(finalTeamB);
    
    // Try to play a drum roll or suspense sound
    try {
      const drumrollSound = new Audio("/drumroll-sound.mp3");
      drumrollSound.volume = 0.5;
      drumrollSound.play().catch(e => console.error("Drumroll audio failed:", e));
    } catch (error) {
      console.error("Drumroll audio error:", error);
    }
    
    // Brief pause before starting the reveal
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reveal players one by one with dramatic effect
    const maxRevealCount = Math.max(finalTeamA.length, finalTeamB.length);
    for (let i = 0; i < maxRevealCount; i++) {
      setRevealIndex(i);
      // Play a reveal sound for each player card
      try {
        const cardRevealSound = new Audio("/card-reveal-sound.mp3");
        cardRevealSound.volume = 0.3;
        cardRevealSound.play().catch(e => console.error("Card reveal audio failed:", e));
      } catch (error) {
        console.error("Card reveal audio error:", error);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Final celebration stage
    setRevealStage("celebration");
    
    // Play victory fanfare
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        const fanfareSound = new Audio("/fanfare-sound.mp3");
        fanfareSound.volume = 0.5;
        fanfareSound.play().catch(e => console.error("Fanfare audio failed:", e));
      }
    } catch (error) {
      console.error("Fanfare audio error:", error);
    }
    
    // Keep the final result visible for celebration moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Set randomizing to false but keep teams visible
    setIsRandomizing(false);
    
    // Call the callback with the randomized players
    const allRandomizedPlayers = [...finalTeamA, ...finalTeamB];
    onRandomize(allRandomizedPlayers, singleTeamSize);
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
