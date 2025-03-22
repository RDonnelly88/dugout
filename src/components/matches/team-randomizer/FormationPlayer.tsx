
import React from 'react';
import { Player } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PositionType } from './types';

interface FormationPlayerProps {
  player: Player;
  position: PositionType;
  index: number;
}

const FormationPlayer = ({ player, position, index }: FormationPlayerProps) => {
  return (
    <div key={player.id} className={`player-position ${position}`}>
      <div className="player-card-formation animate-pop-in" style={{ animationDelay: `${index * 0.15}s` }}>
        <div className="player-number">{index + 1}</div>
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
};

export default FormationPlayer;
