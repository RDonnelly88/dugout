
import React from 'react';
import { Player } from "@/types";
import FormationPlayer from './FormationPlayer';
import { PositionType } from './types';

interface FormationProps {
  players: Player[];
  positions: Record<string, PositionType>;
}

const Formation = ({ players, positions }: FormationProps) => {
  return (
    <div className="animate-fade-in">
      {/* Simple line display instead of formation grid */}
      <div className="flex flex-wrap justify-center gap-4 my-8">
        {players.map((player, idx) => {
          const position = positions[player.id];
          if (!position) return null;
          
          return (
            <FormationPlayer 
              key={player.id} 
              player={player}
              position={position}
              index={idx}
            />
          );
        })}
      </div>
      
      <div className="text-center mt-8">
        <h3 className="text-2xl font-bold text-white mb-2">TEAM LINEUP</h3>
        <p className="text-blue-200">
          {players.length} Player{players.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default Formation;
