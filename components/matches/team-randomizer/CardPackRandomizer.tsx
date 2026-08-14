
import React, { useState, useEffect } from "react";
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import { PackageOpen, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CardPackRandomizerProps {
  players: Player[];
  onComplete: (teamA: Player[], teamB: Player[]) => void;
  onCancel: () => void;
}

const CardPackRandomizer = ({
  players,
  onComplete,
  onCancel,
}: CardPackRandomizerProps) => {
  const [shuffledPlayers, setShuffledPlayers] = useState<Player[]>([]);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const [currentCard, setCurrentCard] = useState<Player | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [remainingCards, setRemainingCards] = useState<Player[]>([]);
  const { toast } = useToast();

  // Initialize the card pack when component mounts
  useEffect(() => {
    if (players.length < 2) {
      toast({
        title: "Not enough players",
        description: "You need at least 2 players to create teams.",
        variant: "destructive",
      });
      onCancel();
      return;
    }

    // Shuffle players
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setShuffledPlayers(shuffled);
    setRemainingCards(shuffled);
  }, [players, toast, onCancel]);

  const revealNextCard = () => {
    if (remainingCards.length === 0) {
      setIsComplete(true);
      return;
    }

    setIsRevealing(true);
    
    // Take the next card from the remaining cards
    const nextCard = remainingCards[0];
    const updatedRemainingCards = remainingCards.slice(1);
    
    setCurrentCard(nextCard);
    setRemainingCards(updatedRemainingCards);
    
    // Determine which team to add the player to
    // If teamA has equal or fewer players than teamB, add to teamA, otherwise add to teamB
    setTimeout(() => {
      if (teamA.length <= teamB.length) {
        setTeamA((prev) => [...prev, nextCard]);
      } else {
        setTeamB((prev) => [...prev, nextCard]);
      }
      
      setIsRevealing(false);
      
      // Automatically set to complete if this was the last card
      if (updatedRemainingCards.length === 0) {
        setIsComplete(true);
      }
    }, 1000); // Delay to allow the card reveal animation to play
  };

  const handleComplete = () => {
    onComplete(teamA, teamB);
  };

  return (
    <div className="card-pack-randomizer">
      {/* Dialog title and description for accessibility */}
      <DialogTitle className="sr-only">Team Randomizer</DialogTitle>
      <DialogDescription className="sr-only">
        Randomly assign players to teams
      </DialogDescription>
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          {isComplete ? "Teams Created!" : "Open Card Pack"}
        </h2>
        <p className="text-blue-300/70 mt-2">
          {isComplete
            ? "All cards have been revealed"
            : `Click on the card pack to reveal players (${remainingCards.length} remaining)`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team A */}
        <div className="team-column">
          <div className="team-header bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-t-lg text-center">
            <h3 className="text-xl font-bold">TEAM A</h3>
          </div>
          <div className="team-list-container bg-gradient-to-b from-red-900/40 to-red-950/60 rounded-b-lg p-1 min-h-[300px] border border-red-500/30">
            {teamA.length === 0 ? (
              <div className="empty-state text-center py-8 text-red-300/50">
                No players yet
              </div>
            ) : (
              <div className="player-list">
                {teamA.map((player, index) => (
                  <PlayerListItem 
                    key={player.id} 
                    player={player} 
                    index={index} 
                    teamColor="A"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team B */}
        <div className="team-column">
          <div className="team-header bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-t-lg text-center">
            <h3 className="text-xl font-bold">TEAM B</h3>
          </div>
          <div className="team-list-container bg-gradient-to-b from-green-900/40 to-green-950/60 rounded-b-lg p-1 min-h-[300px] border border-green-500/30">
            {teamB.length === 0 ? (
              <div className="empty-state text-center py-8 text-green-300/50">
                No players yet
              </div>
            ) : (
              <div className="player-list">
                {teamB.map((player, index) => (
                  <PlayerListItem 
                    key={player.id} 
                    player={player} 
                    index={index}
                    teamColor="B" 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Reveal Area */}
      <div className="card-reveal-area mt-8 flex flex-col items-center justify-center">
        {!isComplete ? (
          <>
            {currentCard && isRevealing ? (
              <div className="revealed-card animate-pop-in">
                <div className="player-card-panel bg-blue-600 p-4 rounded-lg shadow-lg border-2 border-yellow-400">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      {currentCard.image ? (
                        <AvatarImage src={currentCard.image} alt={currentCard.name} />
                      ) : (
                        <AvatarFallback className="bg-blue-800 text-white">
                          {currentCard.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-lg font-bold text-white">{currentCard.name}</span>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={revealNextCard}
                disabled={isRevealing || remainingCards.length === 0}
                className="card-pack py-4 px-6 h-auto flex flex-col items-center gap-3 bg-gradient-to-br from-blue-700 to-indigo-900 hover:from-blue-600 hover:to-indigo-800"
              >
                <PackageOpen className="h-12 w-12 text-blue-200" />
                <span className="text-lg font-medium">
                  {remainingCards.length > 0
                    ? `Click to reveal next player (${remainingCards.length} left)`
                    : "All players revealed"}
                </span>
              </Button>
            )}
          </>
        ) : (
          <Button
            onClick={handleComplete}
            className="complete-button py-4 px-6 h-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg border border-green-500/50 transition-all duration-300"
          >
            <Check className="mr-2 h-5 w-5" />
            <span className="text-lg font-medium">Confirm Teams</span>
          </Button>
        )}
      </div>

      {/* Footer with cancel button */}
      <div className="mt-8 flex justify-end">
        <Button variant="ghost" onClick={onCancel} className="flex items-center gap-2">
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Player list item component
interface PlayerListItemProps {
  player: Player;
  index: number;
  teamColor: 'A' | 'B';
}

const PlayerListItem = ({ player, index, teamColor }: PlayerListItemProps) => {
  const bgColor = teamColor === 'A' 
    ? 'bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-red-800' 
    : 'bg-gradient-to-r from-green-950 to-green-900 hover:from-green-900 hover:to-green-800';
  
  const borderColor = teamColor === 'A' 
    ? 'border-red-500/30' 
    : 'border-green-500/30';
  
  return (
    <div 
      className={`player-list-item ${bgColor} my-1 p-2 rounded-md border ${borderColor} flex items-center gap-3 transition-colors animate-pop-in`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="player-number w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
        {index + 1}
      </div>
      <Avatar className="h-8 w-8 border border-white/30">
        {player.image ? (
          <AvatarImage src={player.image} alt={player.name} />
        ) : (
          <AvatarFallback className="bg-blue-800 text-white">
            {player.name.charAt(0)}
          </AvatarFallback>
        )}
      </Avatar>
      <span className="text-white font-medium">{player.name}</span>
    </div>
  );
};

export default CardPackRandomizer;
