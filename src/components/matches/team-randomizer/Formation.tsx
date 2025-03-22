
import React from 'react';
import { Player } from "@/types";
import FormationPlayer from './FormationPlayer';
import { formationConfigs } from './constants';

interface FormationProps {
  teamA: Player[];
  teamB: Player[];
  teamSize: string;
}

const Formation = ({ teamA, teamB, teamSize }: FormationProps) => {
  console.log("Formation rendering with teamSize:", teamSize);
  console.log("Team A players:", teamA.map(p => p.name));
  console.log("Team B players:", teamB.map(p => p.name));
  
  const formationConfig = formationConfigs[teamSize] || formationConfigs["5"];
  console.log("Using formation config:", formationConfig);

  const renderTeam = (players: Player[], teamName: string, teamColor: 'red' | 'green') => {
    if (!players.length) {
      console.log(`No players to render for ${teamName}`);
      return (
        <div className="empty-team-pitch flex flex-col items-center justify-center h-full text-white/70">
          <p>No players selected</p>
        </div>
      );
    }
    
    const { rows } = formationConfig;
    console.log(`Rendering formation rows for ${teamName}:`, rows);
    
    let playerIndex = 0;
    
    return (
      <div className="relative h-full flex flex-col justify-between py-6">
        {/* Pitch markings */}
        <div className="field-markings">
          <div className="center-circle"></div>
          <div className="halfway-line"></div>
          <div className="penalty-area-top"></div>
          <div className="penalty-area-bottom"></div>
          <div className="goal-area-top"></div>
          <div className="goal-area-bottom"></div>
        </div>
        
        {rows.map((playersInRow, rowIndex) => {
          console.log(`Rendering row ${rowIndex} with ${playersInRow} players for ${teamName}`);
          const positions = rowIndex === 0 ? 'Goalkeeper' : 
                          rowIndex === 1 ? 'Defender' : 
                          rowIndex === 2 ? 'Midfielder' : 'Forward';
          
          return (
            <div 
              key={`${teamName}-row-${rowIndex}`} 
              className="formation-row flex justify-center items-center gap-6"
            >
              {Array(playersInRow).fill(0).map((_, posIndex) => {
                if (playerIndex >= players.length) {
                  console.log(`No player available for ${teamName} at row ${rowIndex}, position ${posIndex}`);
                  return null;
                }
                
                const player = players[playerIndex++];
                console.log(`Adding ${player.name} to ${teamName} at row ${rowIndex}, position ${posIndex}`);
                
                return (
                  <FormationPlayer 
                    key={`${player.id}-${rowIndex}-${posIndex}`} 
                    player={player}
                    index={playerIndex - 1}
                    teamColor={teamColor}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="team-pitch bg-blue-900/80 rounded-lg overflow-hidden h-[300px] relative">
        {renderTeam(teamA, "Team A", "red")}
        <div className="team-name-overlay absolute bottom-0 left-0 right-0 bg-red-700/80 text-white py-2 text-center font-semibold">
          Team A
        </div>
      </div>
      <div className="team-pitch bg-blue-900/80 rounded-lg overflow-hidden h-[300px] relative">
        {renderTeam(teamB, "Team B", "green")}
        <div className="team-name-overlay absolute bottom-0 left-0 right-0 bg-green-700/80 text-white py-2 text-center font-semibold">
          Team B
        </div>
      </div>
    </div>
  );
};

export default Formation;
