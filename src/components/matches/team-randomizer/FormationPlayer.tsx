
import React from 'react';
import { Player } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { usePlayerForm } from "@/hooks/usePlayerForm";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason } from "@/lib/db";

interface FormationPlayerProps {
  player: Player;
  index: number;
  teamColor: 'red' | 'green';
  onClick?: () => void;
}

const FormationPlayer = ({ player, index, teamColor, onClick }: FormationPlayerProps) => {
  console.log(`Rendering FormationPlayer for ${player.name} at index ${index} and team ${teamColor}`);
  
  const bgColor = teamColor === 'red' ? 'bg-red-600' : 'bg-green-600';
  const textColor = 'text-white';
  
  // Get current season
  const { data: currentSeason } = useQuery({
    queryKey: ['currentSeason'],
    queryFn: getCurrentSeason
  });

  // Get player form data
  const { form, isLoading } = usePlayerForm(
    currentSeason?.id || null,
    player.id
  );
  
  // Display last 5 matches in form
  const recentForm = form.slice(0, 5);
  console.log(`Player ${player.name} recent form:`, recentForm);
  
  return (
    <div className="player-formation-card">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div 
            className="flex flex-col items-center cursor-pointer" 
            onClick={onClick}
          >
            <div className="relative">
              <Badge variant="outline" className={`absolute -top-3 -right-3 ${bgColor} ${textColor} w-6 h-6 flex items-center justify-center p-0 rounded-full text-xs font-bold shadow-md`}>
                {index + 1}
              </Badge>
              <Avatar className="h-12 w-12 border-2 border-white/50 shadow-lg hover:border-white transition-all duration-200">
                {player.image ? (
                  <AvatarImage src={player.image} alt={player.name} className="object-cover" />
                ) : (
                  <AvatarFallback className={`text-lg ${bgColor} ${textColor}`}>
                    {player.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <span className="mt-1 text-xs font-medium text-white truncate max-w-[60px] text-center">
              {player.name}
            </span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64 p-3 bg-blue-950 border border-blue-500/30 text-white">
          <div className="flex space-x-3">
            <Avatar className="h-12 w-12">
              {player.image ? (
                <AvatarImage src={player.image} alt={player.name} />
              ) : (
                <AvatarFallback className={bgColor}>
                  {player.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h4 className="font-bold">{player.name}</h4>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-blue-900/50 p-2 rounded-md text-center">
              <div className="text-sm font-bold">{player.stats?.played || 0}</div>
              <div className="text-xs text-blue-300">Played</div>
            </div>
            <div className="bg-green-900/50 p-2 rounded-md text-center">
              <div className="text-sm font-bold">{player.stats?.won || 0}</div>
              <div className="text-xs text-green-300">Won</div>
            </div>
            <div className="bg-red-900/50 p-2 rounded-md text-center">
              <div className="text-sm font-bold">{player.stats?.lost || 0}</div>
              <div className="text-xs text-red-300">Lost</div>
            </div>
          </div>
          
          {/* Player form display */}
          <div className="mt-2 p-2 rounded-md bg-blue-900/30 border border-blue-500/20">
            <h5 className="text-xs font-medium text-blue-300 mb-1">Recent Form</h5>
            <div className="flex space-x-1">
              {isLoading ? (
                <div className="w-full text-center text-xs opacity-70">Loading form data...</div>
              ) : recentForm.length > 0 ? (
                recentForm.map((result, i) => (
                  <div 
                    key={i} 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${result === 'win' ? 'bg-green-700' : 
                        result === 'loss' ? 'bg-red-700' : 'bg-gray-700'}`}
                  >
                    {result === 'win' ? 'W' : result === 'loss' ? 'L' : 'D'}
                  </div>
                ))
              ) : (
                <div className="w-full text-center text-xs opacity-70">No recent matches</div>
              )}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default FormationPlayer;
