
import React from 'react';
import { Player } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Star } from "lucide-react";

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
              <Avatar className="h-32 w-32 border-4 border-blue-500/50 shadow-lg shadow-blue-500/20">
                {player.image ? (
                  <AvatarImage src={player.image} alt={player.name} className="object-cover" />
                ) : (
                  <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-blue-500 to-indigo-700 text-white">
                    {player.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute -top-3 -right-3">
                <Star className="h-8 w-8 text-yellow-400 animate-pulse" />
              </div>
            </div>
            
            <div className="spotlight-name text-3xl font-bold mt-4 mb-2 bg-gradient-to-r from-blue-300 to-indigo-300 text-transparent bg-clip-text">
              {player.name.toUpperCase()}
            </div>
            
            <div className="spotlight-stats grid grid-cols-3 gap-3 mt-4">
              <div className="stat-box bg-blue-900/50 p-3 rounded-lg">
                <div className="stat-value text-2xl font-bold">{player.stats?.played || 0}</div>
                <div className="stat-label text-blue-300">Games</div>
              </div>
              <div className="stat-box bg-green-900/50 p-3 rounded-lg">
                <div className="stat-value text-2xl font-bold">{player.stats?.won || 0}</div>
                <div className="stat-label text-green-300">Wins</div>
              </div>
              <div className="stat-box bg-red-900/50 p-3 rounded-lg">
                <div className="stat-value text-2xl font-bold">{player.stats?.lost || 0}</div>
                <div className="stat-label text-red-300">Losses</div>
              </div>
            </div>
            
            {player.stats && player.stats.played > 0 && (
              <div className="mt-6 text-center">
                <div className="text-sm text-blue-200 mb-1">Win Rate</div>
                <div className="text-3xl font-bold text-white">
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
