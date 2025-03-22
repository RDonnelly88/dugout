
import React, { useState, useEffect } from "react";
import { Player } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, PackageOpen } from "lucide-react";
import PlayerCard from "./PlayerCard";
import { useToast } from "@/hooks/use-toast";

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
    }, 1000); // Delay to allow the card reveal animation to play
  };

  const handleComplete = () => {
    onComplete(teamA, teamB);
  };

  return (
    <div className="card-pack-randomizer">
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
          <h3 className="text-xl font-bold text-center mb-4 text-red-400 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            Team A
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
          </h3>
          <div className="team-players space-y-3 min-h-[300px] border border-dashed border-red-500/30 rounded-lg p-4">
            {teamA.length === 0 ? (
              <div className="text-center p-8 text-red-300/50">
                No players yet
              </div>
            ) : (
              teamA.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  index={index}
                  revealed={true}
                  teamColor="A"
                />
              ))
            )}
          </div>
        </div>

        {/* Team B */}
        <div className="team-column">
          <h3 className="text-xl font-bold text-center mb-4 text-green-400 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            Team B
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
          </h3>
          <div className="team-players space-y-3 min-h-[300px] border border-dashed border-green-500/30 rounded-lg p-4">
            {teamB.length === 0 ? (
              <div className="text-center p-8 text-green-300/50">
                No players yet
              </div>
            ) : (
              teamB.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  index={index}
                  revealed={true}
                  teamColor="B"
                />
              ))
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
                <PlayerCard
                  player={currentCard}
                  index={0}
                  revealed={true}
                  flashing={true}
                />
              </div>
            ) : (
              <Button
                onClick={revealNextCard}
                disabled={isRevealing || remainingCards.length === 0}
                className="card-pack p-8 h-auto flex flex-col items-center gap-4 bg-gradient-to-br from-blue-700 to-indigo-900 hover:from-blue-600 hover:to-indigo-800"
              >
                <PackageOpen className="h-16 w-16 text-blue-200" />
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
            className="complete-button bg-green-600 hover:bg-green-700 p-6 h-auto animate-pulse"
          >
            <span className="text-lg font-medium">Confirm Teams</span>
          </Button>
        )}
      </div>

      {/* Footer with cancel button */}
      <div className="mt-8 flex justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CardPackRandomizer;
