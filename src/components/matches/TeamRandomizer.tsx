
import { Shuffle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Player } from "@/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamRandomizerProps {
  players: Player[];
  onRandomize: (players: Player[], teamSize: number) => void;
  disabled?: boolean;
}

const TeamRandomizer = ({ players, onRandomize, disabled = false }: TeamRandomizerProps) => {
  const [teamSize, setTeamSize] = useState<string>("5");
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(players.map(p => p.id));
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [randomizingPlayers, setRandomizingPlayers] = useState<Player[]>([]);
  const [randomizingIndex, setRandomizingIndex] = useState(-1);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showFeaturedPlayer, setShowFeaturedPlayer] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const availablePlayers = players.filter(player => selectedPlayers.includes(player.id));
  const canRandomize = availablePlayers.length > 0;
  const playerCount = availablePlayers.length;
  
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

  const performDramaticRandomization = async () => {
    setIsRandomizing(true);
    setRevealComplete(false);
    setRandomizingIndex(-1);
    setCurrentPlayer(null);
    setShowFeaturedPlayer(false);
    
    // Create and play audio
    if (!audioRef.current) {
      audioRef.current = new Audio("/randomizer-sound.mp3");
      audioRef.current.volume = 0.5;
    }
    
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    } catch (error) {
      console.error("Audio error:", error);
    }
    
    // Get filtered players and shuffle them
    const playersForRandomization = players.filter(player => selectedPlayers.includes(player.id));
    const shuffledPlayers = shufflePlayers(playersForRandomization);
    
    // Set the randomizing players and start the sequence
    setRandomizingPlayers(shuffledPlayers);
    
    // Slow down - wait before starting the sequence
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Animate through each player with more time between each reveal
    for (let i = 0; i < Math.min(shuffledPlayers.length, 10); i++) {
      // Show the current player in the spotlight
      setCurrentPlayer(shuffledPlayers[i]);
      setShowFeaturedPlayer(true);
      
      // Pause for the featured player to be shown
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add to the revealed players list
      setRandomizingIndex(i);
      setShowFeaturedPlayer(false);
      
      // Pause between player reveals
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Pause for dramatic effect before finalizing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mark the reveal as complete
    setRevealComplete(true);
    
    // Wait for user to see the final result before proceeding
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Complete randomization
    setIsRandomizing(false);
    setRandomizingPlayers([]);
    setRandomizingIndex(-1);
    setCurrentPlayer(null);
    
    // Call the actual randomize function
    onRandomize(playersForRandomization, parseInt(teamSize));
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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4 items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={teamSize} 
            onValueChange={setTeamSize}
            disabled={disabled || isRandomizing}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Players per team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5-a-side</SelectItem>
              <SelectItem value="6">6-a-side</SelectItem>
              <SelectItem value="7">7-a-side</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={performDramaticRandomization}
          variant="outline"
          disabled={disabled || !canRandomize || isRandomizing}
          className="gap-2"
        >
          <Shuffle className={`h-4 w-4 ${isRandomizing ? 'animate-spin' : ''}`} />
          {isRandomizing ? "Randomizing..." : "Randomize Teams"}
          {playerCount > 0 && !isRandomizing && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({playerCount} available)
            </span>
          )}
        </Button>
        
        <Button
          onClick={() => setShowPlayerSelection(!showPlayerSelection)}
          variant="ghost"
          size="sm"
          disabled={isRandomizing}
        >
          {showPlayerSelection ? "Hide Selection" : "Select Players"}
        </Button>
      </div>
      
      {/* Dramatic randomization animation overlay */}
      {isRandomizing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="max-w-3xl w-full mx-auto px-4">
            <h2 className="text-center text-2xl font-bold text-white mb-8 animate-fade-in">
              {revealComplete ? "Teams Assigned!" : "Randomizing Teams"}
            </h2>
            
            {/* Featured player spotlight */}
            {showFeaturedPlayer && currentPlayer && (
              <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black/50">
                <div className="animate-scale-in animate-float max-w-xs w-full">
                  <Card className="overflow-hidden h-full border-4 border-primary shadow-2xl animate-glow bg-card/90 backdrop-blur">
                    <CardContent className="p-6 flex flex-col items-center">
                      <div className="mb-4 relative">
                        <Avatar className="h-32 w-32 mb-2">
                          {currentPlayer.image ? (
                            <AvatarImage src={currentPlayer.image} alt={currentPlayer.name} className="object-cover" />
                          ) : (
                            <AvatarFallback className="text-4xl bg-gradient-blue text-white">
                              {currentPlayer.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                      
                      <h3 className="font-bold text-xl text-center mb-2">{currentPlayer.name}</h3>
                      
                      <div className="mt-2 grid grid-cols-3 gap-2 w-full">
                        <div className="bg-blue-50 dark:bg-blue-950/40 rounded p-2 text-center">
                          <div className="font-semibold text-lg">{currentPlayer.stats?.played || 0}</div>
                          <div className="text-muted-foreground text-xs">Played</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/40 rounded p-2 text-center">
                          <div className="font-semibold text-lg">{currentPlayer.stats?.won || 0}</div>
                          <div className="text-muted-foreground text-xs">Won</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-950/40 rounded p-2 text-center">
                          <div className="font-semibold text-lg">{currentPlayer.stats?.lost || 0}</div>
                          <div className="text-muted-foreground text-xs">Lost</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {/* Team grid of assigned players */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {randomizingPlayers.map((player, idx) => (
                <div 
                  key={player.id}
                  className={`
                    ${idx <= randomizingIndex ? 'animate-scale-in' : 'opacity-0'}
                    duration-500 transition-all player-card-mini
                  `}
                  style={{
                    animationDelay: `${idx * 0.2}s`,
                    transitionDelay: `${idx * 0.2}s`
                  }}
                >
                  <Card className="overflow-hidden h-full border-2 border-primary/50 hover:border-primary bg-card/80 backdrop-blur">
                    <CardContent className="p-4 flex flex-col items-center">
                      <Avatar className="h-16 w-16 mb-2">
                        {player.image ? (
                          <AvatarImage src={player.image} alt={player.name} />
                        ) : (
                          <AvatarFallback className="text-lg bg-gradient-blue text-white">
                            {player.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <h3 className="font-medium text-center line-clamp-1">{player.name}</h3>
                      
                      <div className="mt-2 grid grid-cols-2 gap-1 w-full text-xs">
                        <div className="bg-blue-50 dark:bg-blue-950/40 rounded p-1 text-center">
                          <div className="font-semibold">{player.stats?.played || 0}</div>
                          <div className="text-muted-foreground">Played</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/40 rounded p-1 text-center">
                          <div className="font-semibold">{player.stats?.won || 0}</div>
                          <div className="text-muted-foreground">Won</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            
            {revealComplete && (
              <div className="mt-6 text-center">
                <p className="text-white text-lg animate-fade-in">
                  Your teams are ready!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showPlayerSelection && (
        <div className="border rounded-md p-4 bg-card">
          <div className="mb-2 flex justify-between items-center">
            <h3 className="text-sm font-medium">Select Available Players</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedPlayers(players.map(p => p.id))}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedPlayers([])}
              >
                Clear All
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {players.map(player => (
              <div key={player.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`player-${player.id}`} 
                  checked={selectedPlayers.includes(player.id)}
                  onCheckedChange={() => togglePlayerSelection(player.id)}
                />
                <Label htmlFor={`player-${player.id}`} className="cursor-pointer flex items-center">
                  <HoverCard>
                    <HoverCardTrigger>
                      <span className="hover:underline">{player.name}</span>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-60 p-0">
                      <div className="flex gap-2 p-2">
                        <Avatar className="h-10 w-10">
                          {player.image ? (
                            <AvatarImage src={player.image} alt={player.name} />
                          ) : (
                            <AvatarFallback className="bg-gradient-blue text-white">
                              {player.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h4 className="text-sm font-semibold">{player.name}</h4>
                          <div className="text-xs text-muted-foreground">
                            {player.stats?.played || 0} Games Played
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 p-2 pt-0 text-xs">
                        <div className="flex flex-col items-center bg-green-50 dark:bg-green-950/40 rounded p-1">
                          <span className="font-semibold">{player.stats?.won || 0}</span>
                          <span className="text-muted-foreground">Wins</span>
                        </div>
                        <div className="flex flex-col items-center bg-red-50 dark:bg-red-950/40 rounded p-1">
                          <span className="font-semibold">{player.stats?.lost || 0}</span>
                          <span className="text-muted-foreground">Losses</span>
                        </div>
                        <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-900/40 rounded p-1">
                          <span className="font-semibold">{player.stats?.drawn || 0}</span>
                          <span className="text-muted-foreground">Draws</span>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Hidden audio element for randomization sound effect */}
      <audio ref={audioRef} preload="auto" />
    </div>
  );
};

export default TeamRandomizer;
