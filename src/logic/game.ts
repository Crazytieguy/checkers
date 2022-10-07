import { batch, createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import { xyIsInCell } from "./ui";

export type PlayerSide = "red" | "black";
type Pos = {
  row: number;
  col: number;
  rem?: number;
};

export type PieceState = {
  id: string;
  side: PlayerSide;
  isKing: boolean;
  pos: Pos;
  show: boolean;
};

type GameStateType = {
  turn: PlayerSide;
  pieces: { [k: string]: PieceState };
};

const pieceNumberToPos = Array.from({ length: 64 }, (_, idx) => {
  const { rem, row, col } = idxToPosition(idx);
  if (rem === 1 && row < 3) return [{ row, col }];
  if (rem === 1 && row > 4) return [{ row, col }];
  return [];
}).flat();

function initialState(): GameStateType {
  return {
    turn: "black",
    pieces: Object.fromEntries(
      Array.from({ length: 24 }, (_, i) => {
        const id = String.fromCharCode(i + 65);
        const pos = pieceNumberToPos[i];
        const base = { pos, isKing: false, show: true, id };
        if (i < 12) return [id, { side: "black", ...base }];
        return [id, { side: "red", ...base }];
      })
    ),
  };
}

export function newGame(cells: HTMLDivElement[]) {
  const [gameState, setGameState] = createStore<GameStateType>(initialState());
  const allValidMoves = createMemo(() => getAllValidMoves(gameState));
  const gameOver = () => allValidMoves().length === 0;
  const restartGame = () => setGameState(initialState());
  const playTurn = (fromPiece: PieceState, xy: { x: number; y: number }) => {
    const selectedCellIdx = cells.findIndex((cell) => xyIsInCell(xy, cell));
    const selectedCellPos = idxToPosition(selectedCellIdx);
    const validation = allValidMoves().find(
      (v) =>
        v.fromPiece.id === fromPiece.id &&
        positionToIdx(v.toPos) === positionToIdx(selectedCellPos)
    );
    if (!validation?.valid) return;
    batch(() => {
      setGameState("pieces", fromPiece.id, "pos", validation.toPos);
      if (validation.eat !== undefined) {
        setGameState("pieces", validation.eat.id, "show", false);
      }
      setGameState("turn", other);
    });
  };
  return { gameState, playTurn, allValidMoves, gameOver, restartGame };
}

export function idxToPosition(idx: number) {
  const row = Math.floor(idx / 8);
  const rem = (idx + row) % 2;
  const col = idx % 8;
  return { rem, row, col };
}

function positionToIdx({ row, col }: { row: number; col: number }) {
  if (row < 0 || row > 7 || col < 0 || col > 7) return -1;
  return row * 8 + col;
}

export const other = (p: PlayerSide) => (p === "red" ? "black" : "red");

function getAllValidMoves(gameState: GameStateType) {
  const idxToPiece: (PieceState | undefined)[] = new Array(64);
  const piecesArray = Object.values(gameState.pieces).filter((p) => p.show);
  piecesArray.forEach((p) => (idxToPiece[positionToIdx(p.pos)] = p));
  const validations = piecesArray.flatMap((piece) => {
    const rowDirection = piece.side === "red" ? -1 : 1;
    const { row, col } = piece.pos;
    return [
      { row: row + rowDirection, col: col + 1 },
      { row: row + rowDirection, col: col - 1 },
      { row: row + rowDirection * 2, col: col + 2 },
      { row: row + rowDirection * 2, col: col - 2 },
    ].flatMap((pos) => {
      const v = validateMove({
        fromPiece: piece,
        toPos: pos,
        turn: gameState.turn,
        idxToPiece,
      });
      if (v) return [v];
      return [];
    });
  });
  const eats = validations.filter((v) => v.eat);
  if (eats.length > 0) return eats;
  return validations;
}

export type Validation = {
  valid: boolean;
  fromPiece: PieceState;
  toPos: Pos;
  eat?: PieceState;
};

function validateMove({
  fromPiece,
  toPos,
  turn,
  idxToPiece,
}: {
  fromPiece: PieceState;
  toPos: Pos;
  turn: PlayerSide;
  idxToPiece: (PieceState | undefined)[];
}): Validation | undefined {
  const fromIdx = positionToIdx(fromPiece.pos);
  const toIdx = positionToIdx(toPos);

  // basic validation
  if (fromIdx === toIdx) return;
  if (toIdx === -1) return;

  // only black squares allowed
  if (toPos.rem === 0) return;

  // can't land on a piece
  if (idxToPiece[toIdx]) return;

  // check turn
  if (fromPiece?.side !== turn) return;

  const rowDiff = toPos.row - fromPiece.pos.row;

  // only move forward
  if (fromPiece.side === "red" && rowDiff >= 0) return;
  if (fromPiece.side === "black" && rowDiff <= 0) return;

  const colDiff = toPos.col - fromPiece.pos.col;

  // only move diagonally
  if (Math.abs(rowDiff) !== Math.abs(colDiff)) return;

  // moving 1 is legal
  if (Math.abs(rowDiff) === 1) {
    return { valid: true, fromPiece, toPos };
  }

  // don't move more than 2
  if (Math.abs(rowDiff) !== 2) return;

  const eat =
    idxToPiece[
      positionToIdx({
        row: fromPiece.pos.row + rowDiff / 2,
        col: fromPiece.pos.col + colDiff / 2,
      })
    ];

  // no piece to eat
  if (eat?.side !== other(fromPiece.side)) return;

  return { valid: true, fromPiece, toPos, eat };
}
