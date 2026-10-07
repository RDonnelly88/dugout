
import React from "react";
import { Star } from "lucide-react";
import { usePlayerSeasonAwards } from "@/hooks/usePlayerSeasonAwards";
import { MEDAL } from "@/lib/podium";

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
      <Star key={`gold-${i}`} className={`${iconSize} ${MEDAL[0].text} ${MEDAL[0].fill}`} />
    );
  }
  
  // Add silver stars
  for (let i = 0; i < Math.min(awards.silver, 3 - stars.length); i++) {
    stars.push(
      <Star key={`silver-${i}`} className={`${iconSize} ${MEDAL[1].text} ${MEDAL[1].fill}`} />
    );
  }
  
  // Add bronze stars
  for (let i = 0; i < Math.min(awards.bronze, 3 - stars.length); i++) {
    stars.push(
      <Star key={`bronze-${i}`} className={`${iconSize} ${MEDAL[2].text} ${MEDAL[2].fill}`} />
    );
  }
  
  const remainingAwards = totalAwards - stars.length;
  
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {stars}
      {remainingAwards > 0 && (
        <span className="text-xs text-muted-foreground font-medium ml-1">+{remainingAwards}</span>
      )}
    </div>
  );
};

export default PlayerSeasonStars;
