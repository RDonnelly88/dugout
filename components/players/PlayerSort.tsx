"use client";

import { ArrowDownWideNarrow } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SORT_LABELS, type PlayerSort as SortValue } from "@/lib/player-order";

const ORDER: SortValue[] = ["rank", "odds", "played", "winRate", "name"];

/**
 * What the squad is sorted by. A menu rather than a row of five pills, which
 * on a phone ran off the edge of the screen; the list's last column says
 * which one is picked.
 */
export default function PlayerSort({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (value: SortValue) => void;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as SortValue)}>
      <SelectTrigger aria-label="Sort the squad by" className="h-10 w-auto gap-2 rounded-full">
        <ArrowDownWideNarrow className="h-4 w-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER.map((option) => (
          <SelectItem key={option} value={option}>
            {SORT_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
