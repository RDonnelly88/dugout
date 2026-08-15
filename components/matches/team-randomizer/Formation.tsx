
import React from 'react';
import { Player } from "@/types";
import FormationPlayer from './FormationPlayer';
import { formationConfigs } from './constants';

interface FormationProps {
  teamA: Player[];
  teamB: Player[];
  teamSize: string;
  onRemovePlayer?: (teamId: 'A' | 'B', playerId: string) => void;
}

const Formation = ({ teamA, teamB, teamSize, onRemovePlayer }: FormationProps) => {
  console.log("Formation rendering with teamSize:", teamSize);
  console.log("Team A players:", teamA.map(p => p.name));
  console.log("Team B players:", teamB.map(p => p.name));
  
  const formationConfig = formationConfigs[teamSize] || formationConfigs["5"];
  console.log("Using formation config:", formationConfig);

  const handleRemovePlayer = (team: 'A' | 'B', playerId: string) => {
    if (onRemovePlayer) {
      onRemovePlayer(team, playerId);
    }
  };

  const renderTeam = (players: Player[], teamName: string, teamColor: 'red' | 'green') => {
    if (!players.length) {
      console.log(`No players to render for ${teamName}`);
      return (
        <div className="empty-team-pitch flex flex-col items-center justify-center h-full text-foreground/70">
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
          <div className="center-circle absolute rounded-full border-2 border-white/30 w-20 h-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="halfway-line absolute border-t-2 border-white/30 w-full top-1/2 left-0"></div>
          <div className="penalty-area-top absolute border-b-2 border-r-2 border-l-2 border-white/30 w-36 h-16 top-0 left-1/2 transform -translate-x-1/2"></div>
          <div className="penalty-area-bottom absolute border-t-2 border-r-2 border-l-2 border-white/30 w-36 h-16 bottom-0 left-1/2 transform -translate-x-1/2"></div>
          <div className="goal-area-top absolute border-b-2 border-r-2 border-l-2 border-white/30 w-16 h-6 top-0 left-1/2 transform -translate-x-1/2"></div>
          <div className="goal-area-bottom absolute border-t-2 border-r-2 border-l-2 border-white/30 w-16 h-6 bottom-0 left-1/2 transform -translate-x-1/2"></div>
        </div>
        
        {rows.map((playersInRow, rowIndex) => {
          console.log(`Rendering row ${rowIndex} with ${playersInRow} players for ${teamName}`);
          
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
                const team = teamName === "Team A" ? "A" : "B";
                console.log(`Adding ${player.name} to ${teamName} at row ${rowIndex}, position ${posIndex}`);
                
                return (
                  <FormationPlayer 
                    key={`${player.id}-${rowIndex}-${posIndex}`} 
                    player={player}
                    index={playerIndex - 1}
                    teamColor={teamColor}
                    onClick={() => handleRemovePlayer(team, player.id)}
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
      <div className="team-pitch-container">
        <div className="team-pitch bg-win/15 rounded-t-lg overflow-hidden h-[320px] relative">
          {renderTeam(teamA, "Team A", "red")}
        </div>
        <div className="team-name-banner bg-red-700/80 text-foreground py-2 text-center font-semibold rounded-b-lg">
          Team A
        </div>
      </div>
      <div className="team-pitch-container">
        <div className="team-pitch bg-win/15 rounded-t-lg overflow-hidden h-[320px] relative">
          {renderTeam(teamB, "Team B", "green")}
        </div>
        <div className="team-name-banner bg-green-700/80 text-foreground py-2 text-center font-semibold rounded-b-lg">
          Team B
        </div>
      </div>
    </div>
  );
};

export default Formation;
