import type { BalanceMethod } from "@/lib/team-balance";

/**
 * What the randomiser offers, which is the balancing methods plus doing it
 * yourself.
 *
 * Kept separate from `BalanceMethod` on purpose: `splitTeams` can honour every
 * value of that type, and there is no arrangement it could return for "manual".
 * Widening it there would mean a case that throws or silently shuffles.
 */
export type PickMethod = BalanceMethod | "manual";

export const isBalanceMethod = (method: PickMethod): method is BalanceMethod =>
  method !== "manual";
