
import React from "react";
import { cn } from "@/lib/utils";
import { PlayerFormResult } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

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
          <Loader2 
            className={cn(
              size === 'xs' ? 'w-4 h-4' : 
              size === 'sm' ? 'w-5 h-5' : 
              size === 'md' ? 'w-6 h-6' : 'w-8 h-8',
              "text-blue-400 animate-spin"
            )}
          />
          <span className="text-xs text-muted-foreground ml-2">Loading form data...</span>
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
      case 'dnp':
        bgColor = "bg-gray-600/50";
        textColor = "text-gray-200";
        letter = "DNP";
        break;
    }
    
    return (
      <div 
        key={index}
        className={cn(
          "flex items-center justify-center rounded font-semibold",
          bgColor,
          textColor,
          size === 'xs' ? 'w-4 h-4 text-[8px]' : 
          size === 'sm' ? 'w-5 h-5 text-[10px]' : 
          size === 'md' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
        )}
        title={
          result === 'win' ? 'Win' : 
          result === 'loss' ? 'Loss' : 
          result === 'draw' ? 'Draw' : 
          result === 'dnp' ? 'Did Not Play' : 'No result'
        }
      >
        {result === 'dnp' && size === 'xs' ? '-' : letter}
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
