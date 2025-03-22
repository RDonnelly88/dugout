
import React from 'react';
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerSelectionProps {
  players: Player[];
  selectedPlayers: string[];
  togglePlayerSelection: (playerId: string) => void;
  disabled: boolean;
}

const PlayerSelection = ({ 
  players, 
  selectedPlayers, 
  togglePlayerSelection,
  disabled
}: PlayerSelectionProps) => {
  return (
    <div className="border rounded-md p-4 bg-card">
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-sm font-medium">Select Available Players</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => players.forEach(p => {
              if (!selectedPlayers.includes(p.id)) {
                togglePlayerSelection(p.id);
              }
            })}
            disabled={disabled}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => selectedPlayers.forEach(id => togglePlayerSelection(id))}
            disabled={disabled}
          >
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {players.map(player => (
          <div key={player.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`player-${player.id}`} 
              checked={selectedPlayers.includes(player.id)}
              onCheckedChange={() => togglePlayerSelection(player.id)}
              disabled={disabled}
            />
            <Label htmlFor={`player-${player.id}`} className="cursor-pointer flex items-center">
              <HoverCard>
                <HoverCardTrigger>
                  <span className="hover:underline">{player.name}</span>
                </HoverCardTrigger>
                <HoverCardContent className="w-60 p-0">
                  <div className="flex gap-2 p-2">
                    <Avatar className="h-10 w-10">
                      {player.image ? (
                        <AvatarImage src={player.image} alt={player.name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-blue text-white">
                          {player.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-semibold">{player.name}</h4>
                      <div className="text-xs text-muted-foreground">
                        {player.stats?.played || 0} Games Played
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-2 pt-0 text-xs">
                    <div className="flex flex-col items-center bg-green-50 dark:bg-green-950/40 rounded p-1">
                      <span className="font-semibold">{player.stats?.won || 0}</span>
                      <span className="text-muted-foreground">Wins</span>
                    </div>
                    <div className="flex flex-col items-center bg-red-50 dark:bg-red-950/40 rounded p-1">
                      <span className="font-semibold">{player.stats?.lost || 0}</span>
                      <span className="text-muted-foreground">Losses</span>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-900/40 rounded p-1">
                      <span className="font-semibold">{player.stats?.drawn || 0}</span>
                      <span className="text-muted-foreground">Draws</span>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerSelection;
