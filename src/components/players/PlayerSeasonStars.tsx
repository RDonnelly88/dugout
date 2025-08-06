
import React from "react";
import { Star } from "lucide-react";
import { usePlayerSeasonWins } from "@/hooks/usePlayerSeasonWins";

interface PlayerSeasonStarsProps {
  playerId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PlayerSeasonStars = ({ playerId, size = "sm", className = "" }: PlayerSeasonStarsProps) => {
  const { playerSeasonWins, isLoading } = usePlayerSeasonWins();
  
  if (isLoading) {
    return null;
  }
  
  const wins = playerSeasonWins[playerId] || 0;
  
  if (wins === 0) {
    return null;
  }
  
  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }[size];
  
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: Math.min(wins, 3) }).map((_, index) => (
        <Star key={index} className={`${iconSize} text-amber-400 fill-amber-400`} />
      ))}
      {wins > 3 && (
        <span className="text-xs text-amber-400 font-medium ml-1">+{wins - 3}</span>
      )}
    </div>
  );
};

export default PlayerSeasonStars;
