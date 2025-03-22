
import React from 'react';
import { Player } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award } from "lucide-react";

interface PlayerSpotlightProps {
  player: Player;
}

const PlayerSpotlight = ({ player }: PlayerSpotlightProps) => {
  if (!player) return null;
  
  return (
    <div className="player-spotlight">
      <div className="spotlight-card-container">
        <div className="spotlight-card">
          <div className="spotlight-content">
            <div className="spotlight-avatar">
              <Avatar className="h-full w-full border-4 border-white/20">
                {player.image ? (
                  <AvatarImage src={player.image} alt={player.name} className="object-cover" />
                ) : (
                  <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-blue-900 text-white">
                    {player.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            
            <div className="spotlight-name">
              {player.name.toUpperCase()}
            </div>
            
            <div className="flex items-center gap-2 text-blue-200 mb-2">
              <Award className="h-5 w-5 text-yellow-300" />
              <span>Player Selection</span>
            </div>
            
            <div className="spotlight-stats">
              <div className="stat-box bg-blue-900/50">
                <div className="stat-value">{player.stats?.played || 0}</div>
                <div className="stat-label">Games</div>
              </div>
              <div className="stat-box bg-green-900/50">
                <div className="stat-value">{player.stats?.won || 0}</div>
                <div className="stat-label">Wins</div>
              </div>
              <div className="stat-box bg-red-900/50">
                <div className="stat-value">{player.stats?.lost || 0}</div>
                <div className="stat-label">Losses</div>
              </div>
            </div>
            
            {player.stats && player.stats.played > 0 && (
              <div className="mt-6 text-center">
                <div className="text-sm text-blue-200 mb-1">Win Rate</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round((player.stats.won / player.stats.played) * 100)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSpotlight;
