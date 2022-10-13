import { createMemo, createSignal } from "solid-js";
import useTimeTravel from "./timeTravel";

export const enum CellStatus {
  Empty = 0,
  Occupied = 1,
}

export const enum PieceColor {
  Black = 0,
  Red = 2,
}

export const enum PieceType {
  Regular = 0,
  King = 4,
}

export type PieceTy = CellStatus | PieceColor | PieceType;

export const cellStatus = (p: PieceTy) => p & CellStatus.Occupied;
export const pieceColor = (p: PieceTy) => p & PieceColor.Red;
export const pieceType = (p: PieceTy) => p & PieceType.King;

export type GameStateType = {
  turn: PieceColor;
  inChainPieceIdx: number | null;
  board: Uint8Array;
};

export function initialState(): GameStateType {
  const basePiece = CellStatus.Occupied | PieceType.Regular;
  return {
    turn: PieceColor.Black,
    inChainPieceIdx: null,
    board: new Uint8Array(32)
      .fill(basePiece | PieceColor.Red, 0, 12)
      .fill(basePiece | PieceColor.Black, 20, 32),
  };
}

export function newGame() {
  const [state, setGameState] = createSignal(initialState(), { equals: false });
  const allValidMoves = createMemo(() => getAllValidMoves(state()));
  const timeTravel = useTimeTravel();
  const restart = () => {
    timeTravel.reset();
    setGameState(initialState());
  };

  const play = (move: ValidMove) => {
    const mutators = getValidMoveMutators(move, state());
    timeTravel.do_({
      doMove() {
        setGameState((state) => {
          mutators.doMove(state);
          return state;
        });
      },
      undoMove() {
        setGameState((state) => {
          mutators.undoMove(state);
          return state;
        });
      },
    });
  };

  return {
    state,
    // eslint-disable-next-line solid/reactivity
    get allValidMoves() {
      return allValidMoves();
    },
    // eslint-disable-next-line solid/reactivity
    get winner() {
      if (!allValidMoves().length) {
        return other(state().turn);
      }
    },
    restart,
    play,
    undo: timeTravel.undo,
    redo: timeTravel.redo,
  };
}

export function getValidMoveMutators(
  { from, to, eat }: ValidMove,
  currentState: GameStateType
): {
  doMove: (state: GameStateType) => void;
  undoMove: (state: GameStateType) => void;
} {
  const fromPiece = currentState.board[from];
  const inChainPieceIdx = currentState.inChainPieceIdx;
  const turn = currentState.turn;
  const eatPiece = eat === undefined ? undefined : currentState.board[eat];
  const undoMove = (state: GameStateType) => {
    state.board[from] = fromPiece;
    state.board[to] = 0;
    if (eat !== undefined && eatPiece) {
      state.board[eat] = eatPiece;
    }
    state.inChainPieceIdx = inChainPieceIdx;
    state.turn = turn;
  };
  const doMove = (state: GameStateType) => {
    state.board[to] = fromPiece;
    state.board[from] = 0;
    if (
      (pieceColor(fromPiece) === PieceColor.Black && idxToRow(to) === 0) ||
      (pieceColor(fromPiece) === PieceColor.Red && idxToRow(to) === 7)
    ) {
      state.board[to] |= PieceType.King;
    }
    if (eat !== undefined) {
      state.board[eat] = 0;
      state.inChainPieceIdx = to;
      if (getAllValidMoves(state).length === 0) {
        state.inChainPieceIdx = null;
        state.turn = other(state.turn);
      }
    } else {
      state.turn = other(state.turn);
    }
  };
  return {
    doMove,
    undoMove,
  };
}

export const other = (p: PieceColor) =>
  p === PieceColor.Red ? PieceColor.Black : PieceColor.Red;

export function getAllValidMoves(state: GameStateType) {
  const validations: ValidMove[] = [];
  const eats: ValidMove[] = [];
  const checkPiece = (piece: PieceTy, idx: number) => {
    if (cellStatus(piece) === CellStatus.Empty) return;
    const row = idxToRow(idx);
    const col = idxToCol(idx);
    const rowDirection = pieceColor(piece) === PieceColor.Red ? 1 : -1;
    let multipliers;
    if (eats.length) {
      multipliers = pieceType(piece) === PieceType.King ? [2, -2] : [2];
    } else {
      multipliers =
        pieceType(piece) === PieceType.King ? [1, 2, -1, -2] : [1, 2];
    }
    const colDirections = [1, -1];
    for (const dist of multipliers) {
      for (const colDirection of colDirections) {
        const to = positionToIdx(
          row + rowDirection * dist,
          col + colDirection * dist
        );
        const v = validateMove(state, idx, to);
        if (v) {
          if (v.eat !== undefined) {
            eats.push(v);
          } else {
            validations.push(v);
          }
        }
      }
    }
  };
  if (state.inChainPieceIdx === null) {
    state.board.forEach(checkPiece);
    if (eats.length) return eats;
    return validations;
  }
  checkPiece(state.board[state.inChainPieceIdx], state.inChainPieceIdx);
  return eats;
}

export type ValidMove = {
  from: number;
  to: number;
  eat?: number;
};

export const idxToRow = (idx: number) => Math.floor(idx / 4);
export const idxToCol = (idx: number) =>
  2 * (idx % 4) + (idxToRow(idx) % 2 === 0 ? 1 : 0);

const positionToIdx = (row: number, col: number) => {
  if (row < 0 || row > 7 || col < 0 || col > 7) return;
  return row * 4 + Math.floor(col / 2);
};

function validateMove(
  state: GameStateType,
  from: number,
  to: number | undefined
): ValidMove | undefined {
  // basic validation
  if (from === to) return;
  if (to === undefined) return;

  const fromPiece = state.board[from];
  const toPiece = state.board[to];

  // can't land on a piece
  if (cellStatus(toPiece) === CellStatus.Occupied) return;

  // check turn
  if (pieceColor(fromPiece) !== state.turn) return;

  const toRow = idxToRow(to);
  const fromRow = idxToRow(from);
  const rowDiff = toRow - fromRow;

  // only move forward
  if (pieceType(fromPiece) === PieceType.Regular) {
    if (pieceColor(fromPiece) === PieceColor.Black && rowDiff >= 0) return;
    if (pieceColor(fromPiece) === PieceColor.Red && rowDiff <= 0) return;
  }

  const toCol = idxToCol(to);
  const fromCol = idxToCol(from);
  const colDiff = toCol - fromCol;

  // only move diagonally
  if (Math.abs(rowDiff) !== Math.abs(colDiff)) return;

  // moving 1 is legal
  if (Math.abs(rowDiff) === 1) {
    return { from, to };
  }

  // don't move more than 2
  if (Math.abs(rowDiff) !== 2) return;

  const eat = positionToIdx(fromRow + rowDiff / 2, fromCol + colDiff / 2);

  if (eat === undefined) return;

  const eatPiece = state.board[eat];

  // no piece to eat
  if (
    cellStatus(eatPiece) === CellStatus.Empty ||
    pieceColor(eatPiece) === pieceColor(fromPiece)
  )
    return;

  return { to, from, eat };
}
