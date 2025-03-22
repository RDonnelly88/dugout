
import React from 'react';
import { Player } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { PositionType } from './types';

interface FormationPlayerProps {
  player: Player;
  position: string;
  index: number;
  teamColor: 'red' | 'green';
}

const FormationPlayer = ({ player, position, index, teamColor }: FormationPlayerProps) => {
  console.log(`Rendering FormationPlayer for ${player.name} at position ${position} with index ${index} and team ${teamColor}`);
  
  const bgColor = teamColor === 'red' ? 'bg-red-600' : 'bg-green-600';
  const textColor = 'text-white';
  
  return (
    <div className="player-formation-card">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex flex-col items-center">
            <div className="relative">
              <Badge variant="outline" className={`absolute -top-3 -right-3 ${bgColor} ${textColor} w-6 h-6 flex items-center justify-center p-0 rounded-full text-xs font-bold`}>
                {index + 1}
              </Badge>
              <Avatar className="h-12 w-12 border-2 border-white/50 shadow-lg">
                {player.image ? (
                  <AvatarImage src={player.image} alt={player.name} className="object-cover" />
                ) : (
                  <AvatarFallback className={`text-lg ${bgColor} ${textColor}`}>
                    {player.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <span className="mt-1 text-xs font-medium text-white truncate max-w-[60px] text-center">
              {player.name}
            </span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64 p-3 bg-blue-950 border border-blue-500/30 text-white">
          <div className="flex space-x-3">
            <Avatar className="h-12 w-12">
              {player.image ? (
                <AvatarImage src={player.image} alt={player.name} />
              ) : (
                <AvatarFallback className={bgColor}>
                  {player.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h4 className="font-bold">{player.name}</h4>
              <p className="text-sm text-blue-200">Position: {position}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-blue-900/50 p-2 rounded-md text-center">
              <div className="text-sm font-bold">{player.stats?.played || 0}</div>
              <div className="text-xs text-blue-300">Played</div>
            </div>
            <div className="bg-green-900/50 p-2 rounded-md text-center">
              <div className="text-sm font-bold">{player.stats?.won || 0}</div>
              <div className="text-xs text-green-300">Won</div>
            </div>
            <div className="bg-red-900/50 p-2 rounded-md text-center">
              <div className="text-sm font-bold">{player.stats?.lost || 0}</div>
              <div className="text-xs text-red-300">Lost</div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default FormationPlayer;
