
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSeasons } from "@/lib/db";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Season } from "@/types";

interface SeasonSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

const SeasonSelect = ({ value, onChange }: SeasonSelectProps) => {
  const { data: seasons = [], isLoading } = useQuery({
    queryKey: ['seasons'],
    queryFn: getSeasons
  });

  // Find current season if not already selected
  const currentSeason = !value && seasons.length > 0 
    ? seasons.find(season => season.isCurrent) || seasons[0]
    : undefined;

  // Initialize with current season if not set
  React.useEffect(() => {
    if (!value && currentSeason?.id) {
      onChange(currentSeason.id);
    }
  }, [value, currentSeason, onChange]);

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading seasons..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (seasons.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No seasons available" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a season" />
      </SelectTrigger>
      <SelectContent>
        {seasons.map((season) => (
          <SelectItem key={season.id} value={season.id}>
            {season.name}
            {season.isCurrent && " (Current)"}
          </SelectItem>
        ))}
        <SelectItem value="none">No Season</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SeasonSelect;
