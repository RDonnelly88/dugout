
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
      <div className="formation-grid">
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
        <h3 className="text-2xl font-bold text-white mb-2">TEAM STARTING XI</h3>
        <p className="text-blue-200">
          Formation: {players.length === 5 ? "2-1-1" : players.length === 6 ? "2-2-1" : "3-2-1"}
        </p>
      </div>
    </div>
  );
};

export default Formation;
