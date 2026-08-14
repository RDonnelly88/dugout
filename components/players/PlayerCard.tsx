import Link from "next/link";
import React, { useEffect } from "react";

import { Player, PlayerFormResult, SeasonPlayerStats } from "@/types";
import { Trophy, Edit, Trash2, Ghost } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PlayerFormDisplay from "@/components/players/PlayerFormDisplay";
import { usePlayerRank } from "@/hooks/usePlayerRank";
import { useQueryClient } from "@tanstack/react-query";

interface PlayerCardProps {
  player: Player;
  seasonId: string | null;
  seasonStats: SeasonPlayerStats | undefined;
  formResults: PlayerFormResult[];
  isLoadingForms: boolean;
  onDeleteClick: (player: Player) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  seasonId,
  seasonStats,
  formResults,
  isLoadingForms,
  onDeleteClick,
}) => {
  const queryClient = useQueryClient();
  const hasPlayedMatches = player.stats.played > 0;
  
  // Use the usePlayerRank hook to get consistent rank data
  const { rank, hasPlayedCurrentSeason } = usePlayerRank(
    seasonId,
    player.id
  );
  
  // Ensure form data is always fresh when viewing the player card
  useEffect(() => {
    if (seasonId && player.id) {
      queryClient.invalidateQueries({ 
        queryKey: ['playerForm', seasonId, player.id] 
      });
    }
  }, [seasonId, player.id, queryClient]);

  return (
    <Card key={player.id} className="player-card hover-scale overflow-hidden bg-gray-900 border-gray-800">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-5 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
            {player.image ? (
              <img
                src={player.image}
                alt={player.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-medium text-blue-400">
                <Ghost className="h-8 w-8" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium truncate">{player.name}</h3>
              {seasonId && (
                <Badge className="bg-gray-800 text-white">
                  {hasPlayedCurrentSeason && rank
                    ? `#${rank} in League`
                    : "Rank: N/A"}
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground mt-1">
              {hasPlayedMatches ? (
                <>
                  {player.stats.won} wins in {player.stats.played} games
                </>
              ) : (
                <>No matches played</>
              )}
            </div>
            
            {seasonId && (
              <div className="flex items-center mt-2">
                <PlayerFormDisplay 
                  results={formResults} 
                  size="sm" 
                  isLoading={isLoadingForms && formResults.length === 0}
                />
              </div>
            )}
          </div>
        </div>

        {seasonId && seasonStats && (
          <div className="px-5 pb-3">
            <div className="text-xs font-medium text-blue-400 mb-1 flex items-center">
              <Trophy className="h-3 w-3 mr-1" />
              Season Stats:
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-blue-900/30 rounded p-1">
                <div className="font-bold">{seasonStats.played}</div>
                <div className="text-blue-300">Played</div>
              </div>
              <div className="bg-green-900/30 rounded p-1">
                <div className="font-bold">{seasonStats.wins}</div>
                <div className="text-green-300">Wins</div>
              </div>
              <div className="bg-amber-900/30 rounded p-1">
                <div className="font-bold">{seasonStats.draws}</div>
                <div className="text-amber-300">Draws</div>
              </div>
              <div className="bg-red-900/30 rounded p-1">
                <div className="font-bold">{seasonStats.losses}</div>
                <div className="text-red-300">Losses</div>
              </div>
            </div>
          </div>
        )}

        <div className="player-stats grid grid-cols-4 p-3 bg-gray-800 border-t mt-auto">
          <div className="stat-item">
            <span className="text-xs text-muted-foreground">Played</span>
            <span className="font-semibold">{player.stats.played}</span>
          </div>
          <div className="stat-item">
            <span className="text-xs text-muted-foreground">Won</span>
            <span className="font-semibold text-green-400">{player.stats.won}</span>
          </div>
          <div className="stat-item">
            <span className="text-xs text-muted-foreground">Lost</span>
            <span className="font-semibold text-red-400">{player.stats.lost}</span>
          </div>
          <div className="stat-item">
            <span className="text-xs text-muted-foreground">Drawn</span>
            <span className="font-semibold text-amber-400">{player.stats.drawn}</span>
          </div>
        </div>

        <div className="flex border-t border-gray-800">
          <Link 
            href={`/players/${player.id}`} 
            className="flex-1 py-3 text-center text-sm font-medium text-blue-400 hover:bg-gray-800 transition-colors"
          >
            View
          </Link>
          <div className="w-px bg-gray-800"></div>
          <Link 
            href={`/players/edit/${player.id}`} 
            className="flex-1 py-3 text-center text-sm font-medium text-blue-400 hover:bg-gray-800 transition-colors"
          >
            <Edit className="h-4 w-4 inline mr-1" />
            Edit
          </Link>
          <div className="w-px bg-gray-800"></div>
          <button 
            onClick={() => onDeleteClick(player)} 
            className="flex-1 py-3 text-center text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-4 w-4 inline mr-1" />
            Delete
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
