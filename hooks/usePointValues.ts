import { useMemo } from "react";
import { usePlayerRecords } from "@/hooks/usePlayerRecords";
import { pointValues } from "@/lib/season-positions";

/**
 * What a win and a draw are worth, read off the all-time table the views keep
 * rather than written down in code. Null until the table has loaded, or while
 * nobody has won or drawn.
 */
export function usePointValues() {
  const { records } = usePlayerRecords();
  return useMemo(() => pointValues(records), [records]);
}
