
import React from 'react';
import { Player } from "@/types";
import PlayerCard from './PlayerCard';
import PlayerSpotlight from './PlayerSpotlight';
import Formation from './Formation';
import { PositionType } from './types';

interface RandomizerOverlayProps {
  isRandomizing: boolean;
  revealComplete: boolean;
  formationView: boolean;
  randomizingPlayers: Player[];
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
  assignedPositions,
  revealIndex,
  spotlightPlayer,
  teamSize
}: RandomizerOverlayProps) => {
  if (!isRandomizing) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-white mb-8 animate-fade-in">
          {revealComplete ? "Team Formation Ready!" : "Building Your Team..."}
        </h2>
        
        {formationView && (
          <Formation 
            players={randomizingPlayers} 
            positions={assignedPositions} 
          />
        )}
        
        {!formationView && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {randomizingPlayers.map((player, idx) => (
              <PlayerCard 
                key={player.id}
                player={player}
                index={idx}
                revealed={idx <= revealIndex}
              />
            ))}
          </div>
        )}
        
        {spotlightPlayer && <PlayerSpotlight player={spotlightPlayer} />}
      </div>
    </div>
  );
};

export default RandomizerOverlay;
