import type { BalanceMethod } from "@/lib/team-balance";

/**
 * What the randomiser offers: the balancing methods, dealing down the league
 * table, and doing it yourself.
 *
 * Kept separate from `BalanceMethod` on purpose: `splitTeams` can honour every
 * value of that type, and it could return no arrangement for "manual", nor for
 * "standing" without being handed a table. Widening it there would mean a case
 * that throws or silently shuffles.
 */
export type PickMethod = BalanceMethod | "standing" | "manual";

export const isBalanceMethod = (method: PickMethod): method is BalanceMethod =>
  method === "random" || method === "rating";
