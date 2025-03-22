
import React from "react";
import { TrendingUp, TrendingDown, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayerFormResult } from "@/types";

interface PlayerFormProps {
  form: PlayerFormResult[];
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const PlayerForm = ({ form = [], size = 'md', showLabel = false }: PlayerFormProps) => {
  if (!form.length) {
    return null;
  }

  // Limit to last 5 results
  const recentForm = form.slice(0, 5);
  
  const getFormIcon = (result: PlayerFormResult) => {
    switch (result) {
      case 'win':
        return <TrendingUp className={cn(
          "text-green-500",
          size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
        )} />;
      case 'loss':
        return <TrendingDown className={cn(
          "text-red-500",
          size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
        )} />;
      case 'draw':
        return <CircleDot className={cn(
          "text-amber-500",
          size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
        )} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      {showLabel && (
        <div className="text-xs text-muted-foreground mb-1">
          Recent Form
        </div>
      )}
      <div className="flex space-x-1 items-center">
        {recentForm.map((result, index) => (
          <div 
            key={index}
            className={cn(
              "flex items-center justify-center rounded",
              size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
            )}
          >
            {getFormIcon(result)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerForm;
