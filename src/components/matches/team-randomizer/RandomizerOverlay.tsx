
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
  revealStage: string;
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
  teamSize,
  revealStage
}: RandomizerOverlayProps) => {
  if (!isRandomizing) return null;

  // Function to render simplified team player lists after the dramatic reveal
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

  // Function to render the dramatic player spotlight reveal
  const renderSpotlightReveal = () => {
    return (
      <div className="spotlight-reveal-container flex flex-col items-center justify-center h-full">
        {spotlightPlayer && (
          <div className="animate-fade-in">
            <PlayerSpotlight player={spotlightPlayer} />
          </div>
        )}
      </div>
    );
  };

  // Function to render players being assigned to teams
  const renderAssigningPlayers = () => {
    // Calculate how many players have been revealed for each team
    const teamARevealed = revealIndex >= 0 ? Math.min(revealIndex + 1, teamAPlayers.length) : 0;
    const teamBRevealed = revealIndex >= 0 ? Math.min(revealIndex, teamBPlayers.length) : 0;
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="team-column">
          <h3 className="text-xl font-bold text-red-300 mb-4 text-center">TEAM A</h3>
          <div className="space-y-2">
            {teamAPlayers.slice(0, teamARevealed).map((player, idx) => (
              <PlayerCard 
                key={player.id}
                player={player}
                index={idx}
                revealed={true}
              />
            ))}
          </div>
        </div>
        <div className="team-column">
          <h3 className="text-xl font-bold text-green-300 mb-4 text-center">TEAM B</h3>
          <div className="space-y-2">
            {teamBPlayers.slice(0, teamBRevealed).map((player, idx) => (
              <PlayerCard 
                key={player.id}
                player={player}
                index={idx}
                revealed={true}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Function to render the initial shuffling of players
  const renderShufflingPlayers = () => {
    return (
      <div className="shuffling-container text-center">
        <h3 className="text-xl text-blue-300 mb-6">Shuffling Players</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {randomizingPlayers.map((player, idx) => (
            <div key={player.id} className="shuffle-player-item animate-pulse" style={{ animationDelay: `${idx * 0.2}s` }}>
              <Avatar className="h-16 w-16 border-2 border-blue-500/30">
                {player.image ? (
                  <AvatarImage src={player.image} alt={player.name} />
                ) : (
                  <AvatarFallback className="bg-blue-700 text-white">
                    {player.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-white mb-8 animate-fade-in">
          {revealComplete ? "Teams Ready!" : 
           revealStage === "spotlight" ? "Player Selection" :
           revealStage === "assigning" ? "Building Teams" :
           "Randomizing Players"}
        </h2>
        
        {revealStage === "shuffling" && renderShufflingPlayers()}
        {revealStage === "spotlight" && renderSpotlightReveal()}
        {revealStage === "assigning" && renderAssigningPlayers()}
        {formationView && renderSimpleTeams()}
      </div>
    </div>
  );
};

export default RandomizerOverlay;
