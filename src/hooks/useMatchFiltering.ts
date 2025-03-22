
import { useState } from "react";
import { Match } from "@/types";

export function useMatchFiltering(matches: Match[]) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMatches = matches.filter(match => {
    const teamAName = match.teamA?.name || "";
    const teamBName = match.teamB?.name || "";
    
    return teamAName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           teamBName.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    searchTerm,
    setSearchTerm,
    filteredMatches
  };
}
