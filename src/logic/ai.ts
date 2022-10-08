import { createSignal } from "solid-js";
import type { ValidMove } from "./game";

export const [ai, setAI] = createSignal(true);

export function pickMove(moves: ValidMove[]) {
  return moves[Math.floor(Math.random() * moves.length)];
}
