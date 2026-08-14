import { useRouter } from "next/navigation";

import React from "react";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Season } from "@/types";

interface SeasonSelectorProps {
  seasons: Season[];
  currentSeasonId?: string;
}

const SeasonSelector = ({ seasons, currentSeasonId }: SeasonSelectorProps) => {
  const router = useRouter();
  
  const currentSeason = seasons.find(s => s.id === currentSeasonId) || 
                         seasons.find(s => s.isCurrent) ||
                         seasons[0];
  
  if (!currentSeason) {
    return null;
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto">
          {currentSeason.name}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {seasons.map((season) => (
          <DropdownMenuItem
            key={season.id}
            onClick={() => router.push(`/seasons/${season.id}`)}
            className={season.id === currentSeason.id ? "bg-muted" : ""}
          >
            {season.name}
            {season.isCurrent && (
              <span className="ml-2 rounded-full bg-green-500 h-2 w-2"></span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => router.push("/seasons")}>
          View All Seasons
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SeasonSelector;
