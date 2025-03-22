
import React from 'react';
import { Player } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface PlayerCardProps {
  player: Player;
  index: number;
  revealed: boolean;
  flashing?: boolean;
  selected?: boolean;
  teamColor?: string;
}

const PlayerCard = ({ 
  player, 
  index, 
  revealed, 
  flashing = false,
  selected = false,
  teamColor
}: PlayerCardProps) => {
  const borderColor = teamColor ? 
    (teamColor === 'A' ? 'border-red-500' : 'border-green-500') : 
    (selected ? 'border-yellow-400' : 'border-primary/50');
  
  const bgColor = teamColor ? 
    (teamColor === 'A' ? 'from-red-900 to-red-950' : 'from-green-900 to-green-950') : 
    'from-blue-900 to-blue-950';
  
  return (
    <div 
      className={`
        ${revealed ? 'animate-pop-in' : 'opacity-0'}
        ${flashing ? 'animate-pulse' : ''}
        ${selected ? 'scale-105 shadow-lg shadow-yellow-500/20' : ''}
        duration-500 transition-all player-card-mini
      `}
      style={{
        animationDelay: `${index * 0.1}s`,
        transitionDelay: `${index * 0.1}s`
      }}
    >
      <Card className={`overflow-hidden h-full border-2 ${borderColor} hover:border-primary bg-gradient-to-br ${bgColor} text-white`}>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="absolute top-2 left-2 bg-white text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {index + 1}
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
  );
};

export default PlayerCard;
