"use client";

import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import { SORT_LABELS, type PlayerSort as SortValue } from "@/lib/player-order";

const ORDER: SortValue[] = ["rank", "form", "played", "winRate", "name"];

/**
 * What the squad is sorted by.
 *
 * The grid used to come out in whatever order the query returned, which is no
 * order at all once there are forty of them — every question the page answers
 * ("who is in form", "who turns out", "who is any good") was a question you
 * had to answer by reading every card.
 */
export default function PlayerSort({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (value: SortValue) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      <span className="shrink-0 text-xs text-muted-foreground">Sort by</span>
      <SegmentedControl
        label="Sort the squad by"
        value={value}
        onValueChange={(next) => onChange(next as SortValue)}
      >
        {ORDER.map((option) => (
          <SegmentedControlItem
            key={option}
            value={option}
            className="whitespace-nowrap px-3 py-1 text-xs font-medium"
          >
            {SORT_LABELS[option]}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  );
}
