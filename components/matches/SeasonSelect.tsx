import React, { useId } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSeasons } from "@/lib/db";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTeam } from "@/contexts/TeamContext";

interface SeasonSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label?: string;
}

const SeasonSelect = ({ value, onChange, label = "Season" }: SeasonSelectProps) => {
  const { currentTeam } = useTeam();
  const id = useId();

  const { data: seasons = [], isLoading } = useQuery({
    queryKey: ['seasons', currentTeam?.id],
    queryFn: getSeasons,
    enabled: !!currentTeam
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

  const placeholder = isLoading
    ? "Loading seasons..."
    : seasons.length === 0
      ? "No seasons available"
      : "Select a season";

  // `?? ""` keeps the select controlled from the first render. `value` starts
  // undefined and the effect above fills it in a tick later, which React reads
  // as an uncontrolled input turning into a controlled one.
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="block">
        {label}
      </Label>
      <Select
        value={value ?? ""}
        onValueChange={onChange}
        disabled={isLoading || seasons.length === 0}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
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
    </div>
  );
};

export default SeasonSelect;
