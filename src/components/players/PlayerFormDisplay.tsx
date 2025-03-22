
import React from "react";
import { cn } from "@/lib/utils";
import { PlayerFormResult } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface PlayerFormDisplayProps {
  results: Array<PlayerFormResult>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  isLoading?: boolean;
}

const PlayerFormDisplay = ({ 
  results = [], 
  size = 'md',
  showLabel = false,
  isLoading = false
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
          {[...Array(5)].map((_, index) => (
            <Skeleton 
              key={index}
              className={cn(
                size === 'xs' ? 'w-4 h-4' : 
                size === 'sm' ? 'w-5 h-5' : 
                size === 'md' ? 'w-6 h-6' : 'w-8 h-8',
                "bg-gray-800"
              )}
            />
          ))}
        </div>
      </div>
    );
  }
  
  // Don't render anything if there's no form data or it's empty
  if (!results || results.length === 0) {
    return (
      <div className="text-xs text-gray-400">No match data</div>
    );
  }
  
  // Only show the 5 most recent results
  const recentResults = results.slice(0, 5);
  
  const getFormSquare = (result: PlayerFormResult, index: number) => {
    let bgColor = "bg-gray-400";
    let textColor = "text-white";
    let letter = "-";
    
    switch (result) {
      case 'win':
        bgColor = "bg-green-500";
        textColor = "text-white";
        letter = "W";
        break;
      case 'loss':
        bgColor = "bg-red-500";
        textColor = "text-white";
        letter = "L";
        break;
      case 'draw':
        bgColor = "bg-amber-400";
        textColor = "text-white";
        letter = "D";
        break;
    }
    
    return (
      <div 
        key={index}
        className={cn(
          "flex items-center justify-center rounded font-semibold",
          bgColor,
          textColor,
          size === 'xs' ? 'w-4 h-4 text-[10px]' : 
          size === 'sm' ? 'w-5 h-5 text-xs' : 
          size === 'md' ? 'w-6 h-6 text-sm' : 'w-8 h-8'
        )}
        title={result === 'win' ? 'Win' : result === 'loss' ? 'Loss' : result === 'draw' ? 'Draw' : 'No result'}
      >
        {letter}
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
      </div>
    </div>
  );
};

export default PlayerFormDisplay;
