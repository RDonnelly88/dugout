import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MATCH_STATUSES } from "@/types";

/**
 * The status the app writes has to be one the column will take.
 *
 * Nothing else holds these two together. A CHECK constraint does not survive
 * into `lib/database.types.ts` — the column arrives as `string` — so the
 * compiler is happy with any status at all, and a rejected insert is only
 * visible at run time, against the live database, as a 400.
 */
describe("match status", () => {
  it("offers exactly the statuses the matches table accepts", () => {
    const sql = readFileSync(
      join(process.cwd(), "supabase", "migrations", "20250322000000_init.sql"),
      "utf8"
    );

    const constraint = /"matches_status_check" CHECK \(\("status" = ANY \(ARRAY\[([^\]]*)\]\)\)\)/.exec(sql);
    expect(constraint, "matches_status_check is no longer in the init migration").not.toBeNull();

    const allowed = [...constraint![1].matchAll(/'([^']+)'/g)].map((m) => m[1]);

    expect([...MATCH_STATUSES].sort()).toEqual(allowed.sort());
  });
});
