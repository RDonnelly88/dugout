
import React from 'react';
import { Player } from "@/types";
import FormationPlayer from './FormationPlayer';
import { PositionType } from './types';
import { formationConfigs } from './constants';

interface FormationProps {
  teamA: Player[];
  teamB: Player[];
  positions: Record<string, PositionType>;
  teamSize: string;
}

const Formation = ({ teamA, teamB, positions, teamSize }: FormationProps) => {
  const formationConfig = formationConfigs[teamSize] || formationConfigs["5"];
  
  const renderTeamFormation = (players: Player[], teamName: string) => {
    if (!players.length) return null;
    
    // Calculate how many players to show in each row based on the formation config
    const { rows } = formationConfig;
    let playerIndex = 0;
    
    return (
      <div className="team-formation mb-8">
        <h3 className="text-xl font-bold text-white mb-4">{teamName}</h3>
        
        <div className="formation-rows space-y-6">
          {rows.map((playersInRow, rowIndex) => (
            <div key={`${teamName}-row-${rowIndex}`} className="formation-row flex justify-center gap-4">
              {Array(playersInRow).fill(0).map((_, posIndex) => {
                if (playerIndex >= players.length) return null;
                const player = players[playerIndex++];
                return (
                  <FormationPlayer 
                    key={player.id} 
                    player={player}
                    position={'formation-player'}
                    index={playerIndex - 1}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="animate-fade-in">
      <div className="formation-container space-y-10">
        {renderTeamFormation(teamA, "TEAM A")}
        {renderTeamFormation(teamB, "TEAM B")}
      </div>
      
      <div className="text-center mt-8">
        <h3 className="text-2xl font-bold text-white mb-2">TEAM LINEUP</h3>
        <p className="text-blue-200">
          {formationConfig.name} Formation
        </p>
      </div>
    </div>
  );
};

export default Formation;
