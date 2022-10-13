import { createSignal } from "solid-js";
import {
  cellStatus,
  GameStateType,
  getAllValidMoves,
  getValidMoveMutators,
  pieceColor,
  PieceType,
  pieceType,
  ValidMove,
} from "./game";

export const [ai, setAI] = createSignal(true);
const DEPTH = 4;

function cloneState(state: GameStateType): GameStateType {
  return {
    turn: state.turn,
    inChainPieceIdx: state.inChainPieceIdx,
    board: state.board.slice(),
  };
}

export function pickMove(curState: GameStateType): ValidMove | undefined {
  console.time("pickMove");
  const state = cloneState(curState);
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
  for (const piece of state.board) {
    sum +=
      cellStatus(piece) *
      (pieceColor(piece) === state.turn ? 1 : -1) *
      (pieceType(piece) === PieceType.King ? 2 : 1);
  }
  return sum;
}
