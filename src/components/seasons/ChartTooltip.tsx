
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Ghost } from "lucide-react";
import { PlayerPositionHistory } from "@/hooks/usePlayerPositionHistory";

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
  positionHistories: PlayerPositionHistory[];
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  positionHistories 
}) => {
  if (active && payload && payload.length) {
    const matchDate = payload[0]?.payload?.formattedDate || '';
    return (
      <div className="bg-background border border-border/50 rounded-md p-2 shadow-md">
        <p className="text-sm font-medium mb-1">Match #{label} - {matchDate}</p>
        <div className="space-y-1">
          {payload
            .sort((a: any, b: any) => a.value - b.value)
            .map((entry: any, index: number) => {
              // Extract the player name from the data
              const playerId = entry.dataKey;
              const player = positionHistories.find(p => p.playerId === playerId);
              return (
                <div 
                  key={`item-${index}`} 
                  className="flex items-center gap-2 text-xs"
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={player?.playerImage} alt={player?.playerName} />
                    <AvatarFallback className="text-[8px]">
                      {player?.playerImage ? player?.playerName.charAt(0) : <Ghost className="h-2 w-2" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{player?.playerName}</span>
                  <span className="text-muted-foreground ml-auto">
                    Position: {entry.value}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
  return null;
};

export default ChartTooltip;
