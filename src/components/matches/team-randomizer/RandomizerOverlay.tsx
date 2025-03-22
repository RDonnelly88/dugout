
import React from 'react';
import { Player } from "@/types";
import PlayerCard from './PlayerCard';
import PlayerSpotlight from './PlayerSpotlight';
import Formation from './Formation';
import { PositionType } from './types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RandomizerOverlayProps {
  isRandomizing: boolean;
  revealComplete: boolean;
  formationView: boolean;
  randomizingPlayers: Player[];
  teamAPlayers: Player[];
  teamBPlayers: Player[];
  assignedPositions: Record<string, PositionType>;
  revealIndex: number;
  spotlightPlayer: Player | null;
  teamSize: string;
}

const RandomizerOverlay = ({
  isRandomizing,
  revealComplete,
  formationView,
  randomizingPlayers,
  teamAPlayers,
  teamBPlayers,
  assignedPositions,
  revealIndex,
  spotlightPlayer,
  teamSize
}: RandomizerOverlayProps) => {
  if (!isRandomizing) return null;

  // Function to render simplified team player lists
  const renderSimpleTeams = () => {
    // Determine the longer team to use as reference
    const maxLength = Math.max(teamAPlayers.length, teamBPlayers.length);
    const rows = [];
    
    for (let i = 0; i < maxLength; i++) {
      rows.push(
        <div key={`player-row-${i}`} className="grid grid-cols-2 gap-8 mb-4">
          <div className="flex items-center justify-start">
            {i < teamAPlayers.length && (
              <div className="team-player-card animate-pop-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-red-500/30">
                    {teamAPlayers[i].image ? (
                      <AvatarImage src={teamAPlayers[i].image} alt={teamAPlayers[i].name} />
                    ) : (
                      <AvatarFallback className="bg-red-700 text-white">
                        {teamAPlayers[i].name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-lg font-medium text-red-100">{teamAPlayers[i].name}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-start">
            {i < teamBPlayers.length && (
              <div className="team-player-card animate-pop-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-green-500/30">
                    {teamBPlayers[i].image ? (
                      <AvatarImage src={teamBPlayers[i].image} alt={teamBPlayers[i].name} />
                    ) : (
                      <AvatarFallback className="bg-green-700 text-white">
                        {teamBPlayers[i].name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-lg font-medium text-green-100">{teamBPlayers[i].name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="simple-teams-container mt-8">
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-red-300">TEAM A</h3>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-300">TEAM B</h3>
          </div>
        </div>
        {rows}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-white mb-8 animate-fade-in">
          {revealComplete ? "Teams Ready!" : "Building Your Teams..."}
        </h2>
        
        {formationView && renderSimpleTeams()}
        
        {!formationView && (
          <div className="grid grid-cols-2 gap-4">
            <div className="team-column">
              <h3 className="text-xl font-bold text-red-300 mb-4 text-center">TEAM A</h3>
              <div className="space-y-2">
                {teamAPlayers.map((player, idx) => (
                  <PlayerCard 
                    key={player.id}
                    player={player}
                    index={idx}
                    revealed={idx <= revealIndex}
                  />
                ))}
              </div>
            </div>
            <div className="team-column">
              <h3 className="text-xl font-bold text-green-300 mb-4 text-center">TEAM B</h3>
              <div className="space-y-2">
                {teamBPlayers.map((player, idx) => (
                  <PlayerCard 
                    key={player.id}
                    player={player}
                    index={idx}
                    revealed={idx <= revealIndex}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {spotlightPlayer && <PlayerSpotlight player={spotlightPlayer} />}
      </div>
    </div>
  );
};

export default RandomizerOverlay;
