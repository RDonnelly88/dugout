
import React from "react";
import { Star } from "lucide-react";
import { usePlayerSeasonAwards } from "@/hooks/usePlayerSeasonAwards";

interface PlayerSeasonStarsProps {
  playerId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PlayerSeasonStars = ({ playerId, size = "sm", className = "" }: PlayerSeasonStarsProps) => {
  const { playerSeasonAwards, isLoading } = usePlayerSeasonAwards();
  
  if (isLoading) {
    return null;
  }
  
  const awards = playerSeasonAwards[playerId] || { gold: 0, silver: 0, bronze: 0 };
  const totalAwards = awards.gold + awards.silver + awards.bronze;
  
  if (totalAwards === 0) {
    return null;
  }
  
  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }[size];
  
  const stars = [];
  
  // Add gold stars
  for (let i = 0; i < Math.min(awards.gold, 3); i++) {
    stars.push(
      <Star key={`gold-${i}`} className={`${iconSize} text-amber-400 fill-amber-400`} />
    );
  }
  
  // Add silver stars
  for (let i = 0; i < Math.min(awards.silver, 3 - stars.length); i++) {
    stars.push(
      <Star key={`silver-${i}`} className={`${iconSize} text-gray-400 fill-gray-400`} />
    );
  }
  
  // Add bronze stars
  for (let i = 0; i < Math.min(awards.bronze, 3 - stars.length); i++) {
    stars.push(
      <Star key={`bronze-${i}`} className={`${iconSize} text-amber-600 fill-amber-600`} />
    );
  }
  
  const remainingAwards = totalAwards - stars.length;
  
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {stars}
      {remainingAwards > 0 && (
        <span className="text-xs text-gray-500 font-medium ml-1">+{remainingAwards}</span>
      )}
    </div>
  );
};

export default PlayerSeasonStars;
