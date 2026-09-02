
import React from "react";
import { cn } from "@/lib/utils";
import { PlayerFormResult } from "@/types";

import { Loader2, UserX } from "lucide-react";

interface PlayerFormDisplayProps {
  results: Array<PlayerFormResult>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  isLoading?: boolean;
  /**
   * One more result, drawn after the run and ringed.
   *
   * For a screen about a single night, where the run is context and that night
   * is the subject. Kept apart from `results` so the ring cannot land on a
   * square that is simply the most recent one.
   */
  latest?: PlayerFormResult;
}

const PlayerFormDisplay = ({
  results = [],
  size = 'md',
  showLabel = false,
  isLoading = false,
  latest
}: PlayerFormDisplayProps) => {
  // Create empty form squares for loading state
  if (isLoading) {
    return (
      <div className="flex flex-col">
        {showLabel && (
          <div className="text-xs text-muted-foreground mb-1">
            Recent Form
          </div>
        )}
        <div className="flex space-x-1 items-center">
          <Loader2 
            className={cn(
              size === 'xs' ? 'w-4 h-4' : 
              size === 'sm' ? 'w-5 h-5' : 
              size === 'md' ? 'w-6 h-6' : 'w-8 h-8',
              "text-info animate-spin"
            )}
          />
          <span className="text-xs text-muted-foreground ml-2">Loading form data...</span>
        </div>
      </div>
    );
  }
  
  // Don't render anything if there's no form data or it's empty
  if ((!results || results.length === 0) && !latest) {
    return (
      <div className="text-xs text-muted-foreground">No match data</div>
    );
  }

  // Only show the 5 most recent results
  // For display, we want most recent on the right
  const recentResults = results.slice(0, 5).reverse();

  const getFormSquare = (result: PlayerFormResult, index: number, ringed = false) => {
    let bgColor = "bg-surface-2";
    let textColor = "text-muted-foreground";
    let letter = "-";

    switch (result) {
      case 'win':
        bgColor = "bg-win";
        textColor = "text-win-foreground";
        letter = "W";
        break;
      case 'loss':
        bgColor = "bg-loss";
        textColor = "text-loss-foreground";
        letter = "L";
        break;
      case 'draw':
        bgColor = "bg-draw";
        textColor = "text-draw-foreground";
        letter = "D";
        break;
      case 'dnp':
        bgColor = "bg-surface-2";
        textColor = "text-muted-foreground";
        letter = "DNP";
        break;
    }
    
    return (
      <div 
        key={index}
        className={cn(
          "flex shrink-0 items-center justify-center rounded font-semibold",
          bgColor,
          textColor,
          size === 'xs' ? 'w-4 h-4 text-[8px]' :
          size === 'sm' ? 'w-5 h-5 text-[10px]' :
          size === 'md' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm',
          // The gap is what makes the ring legible. Drawn tight to the square
          // it sits on a win, a loss or a draw — three saturated colours, one
          // of them close enough to the accent to swallow it. Offset, the ring
          // reads against the panel instead, so it looks the same whatever
          // result it happens to land on.
          ringed && "ring-2 ring-accent ring-offset-2 ring-offset-surface-2 ml-2"
        )}
        title={
          ringed
            ? "This match"
            : result === 'win' ? 'Win' :
              result === 'loss' ? 'Loss' :
              result === 'draw' ? 'Draw' :
              result === 'dnp' ? 'Did Not Play' : 'No result'
        }
      >
        {result === 'dnp' ? 
          (size === 'xs' || size === 'sm') ? 
            <UserX className={size === 'xs' ? "w-2.5 h-2.5" : "w-3 h-3"} /> : 
            (size === 'md') ?
              <UserX className="w-3.5 h-3.5" /> :
              "DNP"
          : letter}
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {showLabel && (
        <div className="text-xs text-muted-foreground mb-1">
          Recent Form
        </div>
      )}
      <div className="flex space-x-1 items-center">
        {recentResults.map((result, index) => getFormSquare(result, index))}
        {latest !== undefined && getFormSquare(latest, recentResults.length, true)}
      </div>
    </div>
  );
};

export default PlayerFormDisplay;
