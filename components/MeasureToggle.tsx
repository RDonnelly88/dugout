import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import type { Measure } from "@/lib/measure";

/**
 * The record or the odds, the same switch wherever a page offers both. The
 * record comes first because it is what people are asking.
 */
export default function MeasureToggle({
  value,
  onChange,
  className = "h-9",
}: {
  value: Measure;
  onChange: (next: Measure) => void;
  className?: string;
}) {
  return (
    <SegmentedControl
      label="Record or against the odds"
      value={value}
      onValueChange={(next) => onChange(next as Measure)}
      className={className}
    >
      <SegmentedControlItem value="record" className="h-full px-3 text-xs font-medium">
        Record
      </SegmentedControlItem>
      <SegmentedControlItem value="odds" className="h-full px-3 text-xs font-medium">
        Against the odds
      </SegmentedControlItem>
    </SegmentedControl>
  );
}
