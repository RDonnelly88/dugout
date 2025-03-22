
import { Shuffle, Users, Award, Layers } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

interface TeamRandomizerProps {
  players: Player[];
  onRandomize: (players: Player[], teamSize: number) => void;
  disabled?: boolean;
}

// Position types for formation display
type PositionType = 
  | 'goalkeeper'
  | 'defender-left'
  | 'defender-center-left'
  | 'defender-center-right'
  | 'defender-right'
  | 'midfielder-left'
  | 'midfielder-center-left'
  | 'midfielder-center-right'
  | 'midfielder-right'
  | 'forward-left'
  | 'forward-center'
  | 'forward-right';

// Formation positions for different team sizes
const formationPositions: Record<string, PositionType[]> = {
  "5": [
    'goalkeeper',
    'defender-left',
    'defender-right',
    'midfielder-center',
    'forward-center'
  ],
  "6": [
    'goalkeeper',
    'defender-left',
    'defender-right',
    'midfielder-left',
    'midfielder-right',
    'forward-center'
  ],
  "7": [
    'goalkeeper',
    'defender-left',
    'defender-center',
    'defender-right',
    'midfielder-left',
    'midfielder-right',
    'forward-center'
  ],
  "11": [
    'goalkeeper',
    'defender-left',
    'defender-center-left',
    'defender-center-right',
    'defender-right',
    'midfielder-left',
    'midfielder-center-left',
    'midfielder-center-right',
    'midfielder-right',
    'forward-left',
    'forward-right'
  ]
};

const TeamRandomizer = ({ players, onRandomize, disabled = false }: TeamRandomizerProps) => {
  const [teamSize, setTeamSize] = useState<string>("5");
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(players.map(p => p.id));
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [randomizingPlayers, setRandomizingPlayers] = useState<Player[]>([]);
  const [assignedPositions, setAssignedPositions] = useState<Record<string, PositionType>>({});
  const [spotlightPlayer, setSpotlightPlayer] = useState<Player | null>(null);
  const [revealComplete, setRevealComplete] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [formationView, setFormationView] = useState(false);
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

  const assignPositions = (players: Player[], teamSize: string) => {
    // Get the positions for the selected team size
    const positions = formationPositions[teamSize] || formationPositions["5"];
    
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

  const performDramaticRandomization = async () => {
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
    const playersForRandomization = players.filter(player => selectedPlayers.includes(player.id));
    const shuffledPlayers = shufflePlayers(playersForRandomization);
    
    // Assign positions to players
    const positions = assignPositions(shuffledPlayers, teamSize);
    setAssignedPositions(positions);
    
    // Set the randomizing players
    setRandomizingPlayers(shuffledPlayers.slice(0, Object.keys(positions).length));
    
    // Dramatic pause before starting
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Loop through each player and spotlight them
    for (let i = 0; i < shuffledPlayers.length; i++) {
      // Skip if we've assigned enough players already
      if (i >= Object.keys(positions).length) break;
      
      // Set current player in spotlight
      setSpotlightPlayer(shuffledPlayers[i]);
      
      // Wait for dramatic effect (longer for first players)
      const spotlightDuration = i === 0 ? 3500 : 3000;
      await new Promise(resolve => setTimeout(resolve, spotlightDuration));
      
      // Add to revealed players
      setRevealIndex(i);
      setSpotlightPlayer(null);
      
      // Pause between reveals
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Show the formation view
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
    
    // Call the actual randomize function with the properly sized subset of players
    const finalPlayers = shuffledPlayers.slice(0, parseInt(teamSize) * 2);
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="max-w-4xl w-full mx-auto px-4">
            <h2 className="text-center text-3xl font-bold text-white mb-8 animate-fade-in">
              {revealComplete ? "Team Formation Ready!" : "Building Your Team..."}
            </h2>
            
            {/* Formation view */}
            {formationView && (
              <div className="animate-fade-in">
                <div className="formation-grid">
                  {randomizingPlayers.map((player, idx) => {
                    const position = assignedPositions[player.id];
                    if (!position) return null;
                    
                    return (
                      <div key={player.id} className={`player-position ${position}`}>
                        <div className="player-card-formation animate-pop-in" style={{ animationDelay: `${idx * 0.15}s` }}>
                          <div className="player-number">{idx + 1}</div>
                          <Avatar className="h-full w-full">
                            {player.image ? (
                              <AvatarImage src={player.image} alt={player.name} className="object-cover" />
                            ) : (
                              <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-blue-800 text-white">
                                {player.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="player-name">{player.name.toUpperCase()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-center mt-8">
                  <h3 className="text-2xl font-bold text-white mb-2">TEAM STARTING XI</h3>
                  <p className="text-blue-200">
                    Formation: {teamSize === "5" ? "2-1-1" : teamSize === "6" ? "2-2-1" : "3-2-1"}
                  </p>
                </div>
              </div>
            )}
            
            {/* Individual player cards (non-formation view) */}
            {!formationView && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {randomizingPlayers.map((player, idx) => (
                  <div 
                    key={player.id}
                    className={`
                      ${idx <= revealIndex ? 'animate-pop-in' : 'opacity-0'}
                      duration-500 transition-all player-card-mini
                    `}
                    style={{
                      animationDelay: `${idx * 0.2}s`,
                      transitionDelay: `${idx * 0.2}s`
                    }}
                  >
                    <Card className="overflow-hidden h-full border-2 border-primary/50 hover:border-primary bg-gradient-to-br from-blue-900 to-blue-950 text-white">
                      <CardContent className="p-4 flex flex-col items-center">
                        <div className="absolute top-2 left-2 bg-white text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        
                        <Avatar className="h-16 w-16 mb-2 mt-4">
                          {player.image ? (
                            <AvatarImage src={player.image} alt={player.name} className="object-cover" />
                          ) : (
                            <AvatarFallback className="text-lg bg-gradient-blue text-white">
                              {player.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <h3 className="font-medium text-center line-clamp-1 mt-1">{player.name}</h3>
                        
                        <div className="mt-2 grid grid-cols-3 gap-1 w-full text-xs">
                          <div className="bg-blue-800/50 rounded p-1 text-center">
                            <div className="font-semibold">{player.stats?.played || 0}</div>
                            <div className="text-blue-200">Played</div>
                          </div>
                          <div className="bg-green-800/50 rounded p-1 text-center">
                            <div className="font-semibold">{player.stats?.won || 0}</div>
                            <div className="text-green-200">Won</div>
                          </div>
                          <div className="bg-red-900/50 rounded p-1 text-center">
                            <div className="font-semibold">{player.stats?.lost || 0}</div>
                            <div className="text-red-200">Lost</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
            
            {/* Featured player spotlight */}
            {spotlightPlayer && (
              <div className="player-spotlight">
                <div className="spotlight-card-container">
                  <div className="spotlight-card">
                    <div className="spotlight-content">
                      <div className="spotlight-avatar">
                        <Avatar className="h-full w-full border-4 border-white/20">
                          {spotlightPlayer.image ? (
                            <AvatarImage src={spotlightPlayer.image} alt={spotlightPlayer.name} className="object-cover" />
                          ) : (
                            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-blue-900 text-white">
                              {spotlightPlayer.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                      
                      <div className="spotlight-name">
                        {spotlightPlayer.name.toUpperCase()}
                      </div>
                      
                      <div className="flex items-center gap-2 text-blue-200 mb-2">
                        <Award className="h-5 w-5 text-yellow-300" />
                        <span>Player Selection</span>
                      </div>
                      
                      <div className="spotlight-stats">
                        <div className="stat-box bg-blue-900/50">
                          <div className="stat-value">{spotlightPlayer.stats?.played || 0}</div>
                          <div className="stat-label">Games</div>
                        </div>
                        <div className="stat-box bg-green-900/50">
                          <div className="stat-value">{spotlightPlayer.stats?.won || 0}</div>
                          <div className="stat-label">Wins</div>
                        </div>
                        <div className="stat-box bg-red-900/50">
                          <div className="stat-value">{spotlightPlayer.stats?.lost || 0}</div>
                          <div className="stat-label">Losses</div>
                        </div>
                      </div>
                      
                      {spotlightPlayer.stats && spotlightPlayer.stats.played > 0 && (
                        <div className="mt-6 text-center">
                          <div className="text-sm text-blue-200 mb-1">Win Rate</div>
                          <div className="text-2xl font-bold text-white">
                            {Math.round((spotlightPlayer.stats.won / spotlightPlayer.stats.played) * 100)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
