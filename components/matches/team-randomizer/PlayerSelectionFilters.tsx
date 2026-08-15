import React from 'react';
import { Search, Users, UserCheck } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlayerSelectionFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showActiveOnly: boolean;
  setShowActiveOnly: (show: boolean) => void;
  totalCount: number;
  filteredCount: number;
  /** Everyone picked, not just the ones on screen. */
  selectedCount: number;
  /** Picked but filtered out of view. */
  hiddenSelectedCount: number;
}

const PlayerSelectionFilters = ({
  searchTerm,
  setSearchTerm,
  showActiveOnly,
  setShowActiveOnly,
  totalCount,
  filteredCount,
  selectedCount,
  hiddenSelectedCount
}: PlayerSelectionFiltersProps) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={showActiveOnly ? "default" : "outline"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowActiveOnly(!showActiveOnly);
            }}
            className="gap-2"
          >
            {showActiveOnly ? <UserCheck className="h-3 w-3" /> : <Users className="h-3 w-3" />}
            {showActiveOnly ? "Active Only" : "All Players"}
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="text-xs">
          {selectedCount} of {totalCount} playing
        </Badge>
        {filteredCount !== totalCount && (
          <Badge variant="outline" className="text-xs">
            Showing {filteredCount}
          </Badge>
        )}
        {hiddenSelectedCount > 0 && (
          <Badge variant="outline" className="text-xs">
            {hiddenSelectedCount} picked but hidden
          </Badge>
        )}
      </div>
    </div>
  );
};

export default PlayerSelectionFilters;