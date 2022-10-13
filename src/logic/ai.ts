import { createSignal } from "solid-js";
import {
  GameStateType,
  getAllValidMoves,
  getValidMoveMutators,
  ValidMove,
} from "./game";

export const [ai, setAI] = createSignal(true);
const DEPTH = 4;

export function pickMove(curState: GameStateType): ValidMove | undefined {
  console.time("pickMove");
  const state = JSON.parse(JSON.stringify(curState));
  const turn = state.turn;
  let max = -Infinity;
  let best = undefined;
  for (const m of getAllValidMoves(state)) {
    const value = runWithMutation(m, state, () =>
      state.turn === turn ? search(state) : -search(state)
    );
    if (value > max) {
      max = value;
      best = m;
    }
  }
  console.timeEnd("pickMove");
  return best;
}

function search(state: GameStateType, depth: number = DEPTH): number {
  if (depth === 0) {
    return boardValue(state);
  }
  const turn = state.turn;
  let max = -Infinity;
  for (const m of getAllValidMoves(state)) {
    const value = runWithMutation(m, state, () =>
      state.turn === turn ? search(state, depth - 1) : -search(state, depth - 1)
    );
    max = max > value ? max : value;
  }
  return max;
}

function runWithMutation<T>(
  move: ValidMove,
  state: GameStateType,
  callback: () => T
): T {
  const mutators = getValidMoveMutators(move, state);
  mutators.doMove(state);
  const res = callback();
  mutators.undoMove(state);
  return res;
}

function boardValue(state: GameStateType) {
  let sum = 0;
  for (const piece of state.pieces) {
    sum +=
      Number(piece.isInPlay) *
      (piece.side === state.turn ? 1 : -1) *
      (piece.isKing ? 2 : 1);
  }
  return sum;
}
