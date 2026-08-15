import Link from "next/link";

import React from "react";

import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PlayerSearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const PlayerSearchBar: React.FC<PlayerSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 w-full sm:w-[300px] bg-surface border-border"
        />
      </div>
      <Button asChild>
        <Link href="/players/add">
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Link>
      </Button>
    </div>
  );
};

export default PlayerSearchBar;
