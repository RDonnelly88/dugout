import type { Player } from "@/types";

/** Where a player is standing: on one of the sides, or not yet on either. */
export type Slot = "A" | "B" | "bench";

export type Board = Record<string, Slot>;

/**
 * Everyone waiting, nobody placed.
 *
 * Sorting a squad into two sides is kept out of the component because the
 * fiddly part is not the dragging, it is what a drag means when several
 * players are picked up at once, and that is worth being able to test
 * without a pointer.
 *
 * Opening on a shuffle meant every side had to be un-picked before it could
 * be picked, and a board that already looks answered invites nudging rather
 * than choosing. Picking by hand starts from nothing.
 */
export const emptyBoard = (players: Player[]): Board =>
  Object.fromEntries(players.map((player) => [player.id, "bench" as const]));

/** Everyone standing in one place, in the squad's own order. */
export const occupants = (board: Board, slot: Slot, players: Player[]): Player[] =>
  players.filter((player) => (board[player.id] ?? "bench") === slot);

/**
 * Move a group somewhere in one go.
 *
 * Takes a set rather than an id because moving one player and moving nine
 * are the same gesture here — dropping a selection is dropping all of it.
 */
export function assign(board: Board, ids: Iterable<string>, slot: Slot): Board {
  const moved = { ...board };
  for (const id of ids) moved[id] = slot;
  return moved;
}

/** Turn the two sides around, leaving anyone benched where they are. */
export function swapSides(board: Board): Board {
  return Object.fromEntries(
    Object.entries(board).map(([id, slot]) => [
      id,
      slot === "A" ? "B" : slot === "B" ? "A" : slot,
    ])
  );
}

/**
 * What a drag should carry.
 *
 * Dragging a player who is part of the current selection takes the whole
 * selection with them; dragging anybody else is a single move and leaves the
 * selection alone. Anything else surprises somebody — picking up an unpicked
 * player and having nine others follow is not what the gesture looked like.
 */
export function dragged(id: string, selection: ReadonlySet<string>): Set<string> {
  return selection.has(id) ? new Set(selection) : new Set([id]);
}

/** Both sides need somebody on them before a match can be made of it. */
export const usable = (board: Board): boolean => {
  const slots = Object.values(board);
  return slots.includes("A") && slots.includes("B");
};
