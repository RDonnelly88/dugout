import Link from "next/link";

import React from "react";

import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ActiveFilter, { type ActiveScope } from "./ActiveFilter";

interface PlayerSearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  scope: ActiveScope;
  setScope: (scope: ActiveScope) => void;
  counts: Record<ActiveScope, number>;
}

const PlayerSearchBar: React.FC<PlayerSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  scope,
  setScope,
  counts,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface pl-9 sm:w-[280px]"
          />
        </div>
        <ActiveFilter value={scope} onChange={setScope} counts={counts} />
      </div>
      <Button asChild className="w-full sm:w-auto">
        <Link href="/players/add">
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Link>
      </Button>
    </div>
  );
};

export default PlayerSearchBar;
