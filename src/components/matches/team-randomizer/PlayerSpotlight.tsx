
import React from 'react';
import { Player } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Star, Ghost } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PlayerSpotlightProps {
  player: Player;
}

const PlayerSpotlight = ({ player }: PlayerSpotlightProps) => {
  if (!player) return null;
  
  // Calculate win rate
  const winRate = player.stats.played > 0 
    ? Math.round((player.stats.won / player.stats.played) * 100)
    : 0;
  
  return (
    <div className="player-spotlight">
      <div className="spotlight-card-container animate-float neon-glow">
        <div className="spotlight-card glass-effect neon-border">
          <div className="spotlight-content">
            <div className="spotlight-avatar">
              <Avatar className="h-32 w-32 border-4 border-accent/50 shadow-lg shadow-accent/20">
                {player.image ? (
                  <AvatarImage src={player.image} alt={player.name} className="object-cover" />
                ) : (
                  <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-accent/80 to-accent/60 text-white">
                    <Ghost className="h-16 w-16" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute -top-3 -right-3 animate-pulse">
                <Star className="h-8 w-8 text-accent drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
              </div>
            </div>
            
            <div className="spotlight-name text-3xl font-bold mt-4 mb-2 gradient-text-accent">
              {player.name.toUpperCase()}
            </div>
            
            <div className="spotlight-stats grid grid-cols-3 gap-3 mt-4">
              <div className="stat-box bg-gray-800/70 p-3 rounded-lg border border-gray-700/50 shadow-inner">
                <div className="stat-value text-2xl font-bold gradient-text">{player.stats?.played || 0}</div>
                <div className="stat-label text-gray-300">Games</div>
              </div>
              <div className="stat-box bg-accent/10 p-3 rounded-lg border border-accent/30 shadow-inner">
                <div className="stat-value text-2xl font-bold gradient-text-accent">{player.stats?.won || 0}</div>
                <div className="stat-label text-accent/80">Wins</div>
              </div>
              <div className="stat-box bg-red-900/20 p-3 rounded-lg border border-red-500/20 shadow-inner">
                <div className="stat-value text-2xl font-bold text-red-400">{player.stats?.lost || 0}</div>
                <div className="stat-label text-red-300/80">Losses</div>
              </div>
            </div>
            
            {player.stats && player.stats.played > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm text-gray-300">Win Rate</div>
                  <div className="text-sm font-bold text-accent">{winRate}%</div>
                </div>
                <Progress value={winRate} className="h-2 bg-gray-800/70 border border-gray-700/50" indicatorClassName="bg-gradient-to-r from-accent/80 to-accent" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSpotlight;
