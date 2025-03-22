
import React from "react";
import { ArrowUp, ArrowDown, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerFormDisplayProps {
  results: Array<'win' | 'loss' | 'draw' | null>;
  size?: 'sm' | 'md' | 'lg';
}

const PlayerFormDisplay = ({ results = [], size = 'md' }: PlayerFormDisplayProps) => {
  const sizeClass = size === 'sm' 
    ? 'w-6 h-6 text-xs' 
    : size === 'md' 
      ? 'w-8 h-8 text-sm' 
      : 'w-10 h-10 text-base';
  
  if (!results || results.length === 0) {
    return (
      <div className="text-xs text-gray-400">No match data</div>
    );
  }
  
  // Only show the 5 most recent results
  const recentResults = results.slice(0, 5);
  
  return (
    <div className="flex gap-1">
      {recentResults.map((result, index) => {
        if (result === 'win') {
          return (
            <div 
              key={index} 
              className={cn(
                "flex items-center justify-center rounded-full bg-green-800 text-green-200 font-semibold",
                sizeClass
              )}
              title="Win"
            >
              <ArrowUp className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
            </div>
          );
        } else if (result === 'loss') {
          return (
            <div 
              key={index} 
              className={cn(
                "flex items-center justify-center rounded-full bg-red-800 text-red-200 font-semibold",
                sizeClass
              )}
              title="Loss"
            >
              <ArrowDown className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
            </div>
          );
        } else if (result === 'draw') {
          return (
            <div 
              key={index} 
              className={cn(
                "flex items-center justify-center rounded-full bg-amber-800 text-amber-200 font-semibold",
                sizeClass
              )}
              title="Draw"
            >
              <Circle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} strokeWidth={3} />
            </div>
          );
        } else {
          return (
            <div 
              key={index} 
              className={cn(
                "flex items-center justify-center rounded-full bg-gray-800 text-gray-400 font-semibold",
                sizeClass
              )}
              title="No result"
            >
              -
            </div>
          );
        }
      })}
    </div>
  );
};

export default PlayerFormDisplay;
