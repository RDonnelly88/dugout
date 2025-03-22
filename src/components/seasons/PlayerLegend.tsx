
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Ghost } from "lucide-react";
import { PlayerPositionHistory } from "@/hooks/usePlayerPositionHistory";
import { CHART_COLORS } from "./chart-utils";

interface PlayerLegendProps {
  players: PlayerPositionHistory[];
  hoveredPlayerId: string | null;
  setHoveredPlayerId: (id: string | null) => void;
}

const PlayerLegend: React.FC<PlayerLegendProps> = ({ 
  players, 
  hoveredPlayerId, 
  setHoveredPlayerId 
}) => {
  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {players.map((player, index) => {
        const lastPosition = player.history[player.history.length - 1]?.position;
        return (
          <div
            key={player.playerId}
            className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
              hoveredPlayerId === player.playerId ? 'bg-muted' : ''
            }`}
            onMouseEnter={() => setHoveredPlayerId(player.playerId)}
            onMouseLeave={() => setHoveredPlayerId(null)}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <Avatar className="h-5 w-5">
              <AvatarImage src={player.playerImage} alt={player.playerName} />
              <AvatarFallback className="text-[10px]">
                {player.playerImage ? player.playerName.charAt(0) : <Ghost className="h-3 w-3" />}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs truncate flex-1">{player.playerName}</div>
            <div className="text-xs font-medium">#{lastPosition}</div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerLegend;
