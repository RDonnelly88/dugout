
import React from "react";
import { cn } from "@/lib/utils";
import { PlayerFormResult } from "@/types";

interface PlayerFormProps {
  form: PlayerFormResult[];
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const PlayerForm = ({ form = [], size = 'md', showLabel = false }: PlayerFormProps) => {
  // Don't render anything if there's no form data or it's empty
  if (!form || form.length === 0) {
    return null;
  }

  // Limit to last 5 results
  const recentForm = form.slice(0, 5);
  
  const getFormSquare = (result: PlayerFormResult, index: number) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-700";
    let letter = "-";
    
    switch (result) {
      case 'win':
        bgColor = "bg-win";
        textColor = "text-foreground";
        letter = "W";
        break;
      case 'loss':
        bgColor = "bg-loss";
        textColor = "text-foreground";
        letter = "L";
        break;
      case 'draw':
        bgColor = "bg-amber-400";
        textColor = "text-foreground";
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
        {recentForm.map((result, index) => getFormSquare(result, index))}
      </div>
    </div>
  );
};

export default PlayerForm;
