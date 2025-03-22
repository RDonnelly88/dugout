
import React from 'react';
import { Player } from "@/types";
import PlayerCard from './PlayerCard';
import PlayerSpotlight from './PlayerSpotlight';
import Formation from './Formation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RandomizerOverlayProps {
  isRandomizing: boolean;
  revealComplete: boolean;
  formationView: boolean;
  randomizingPlayers: Player[];
  teamAPlayers: Player[];
  teamBPlayers: Player[];
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
  revealIndex,
  spotlightPlayer,
  teamSize,
  revealStage
}: RandomizerOverlayProps) => {
  console.log("RandomizerOverlay render:", {
    isRandomizing,
    revealComplete,
    teamSize,
    revealStage,
    teamACount: teamAPlayers.length,
    teamBCount: teamBPlayers.length
  });
  
  if (!isRandomizing) return null;

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
                teamColor="A"
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
                teamColor="B"
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

  // When teams are complete, show formation view
  const renderCompletedTeams = () => {
    console.log("Rendering completed teams in formation view");
    return (
      <Formation 
        teamA={teamAPlayers} 
        teamB={teamBPlayers} 
        teamSize={teamSize}
      />
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
        {revealComplete && renderCompletedTeams()}
      </div>
    </div>
  );
};

export default RandomizerOverlay;
