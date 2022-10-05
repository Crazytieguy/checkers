import { batch, createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import { xyIsInCell } from "./ui";

export type playerSide = "red" | "black";

type GameStateType = {
  turn: playerSide;
  pieces: (playerSide | null | undefined)[];
};

function initialState(): GameStateType {
  return {
    turn: "black",
    pieces: Array.from({ length: 64 }, (_, idx) => {
      const { rem, row } = idxToPosition(idx);
      if (rem === 1 && row < 3) return "black";
      if (rem === 1 && row > 4) return "red";
      return null;
    }),
  };
}

export function newGame(cells: HTMLDivElement[]) {
  const [gameState, setGameState] = createStore<GameStateType>(initialState());
  const allValidMoves = createMemo(() => getAllValidMoves(gameState));
  const gameOver = () => allValidMoves().length === 0;
  const restartGame = () => setGameState(initialState());
  const playTurn = (pieceIdx: number, xy: { x: number; y: number }) => {
    const selectedCellIdx = cells.findIndex((cell) => xyIsInCell(xy, cell));
    const validation = allValidMoves().find(
      (v) => v?.fromIdx === pieceIdx && v.toIdx === selectedCellIdx
    );
    if (!validation?.valid) return;
    batch(() => {
      setGameState("pieces", selectedCellIdx, gameState.pieces[pieceIdx]);
      setGameState("pieces", pieceIdx, null);
      if (validation.eat !== undefined) {
        setGameState("pieces", validation.eat, null);
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

export const other = (p: playerSide) => (p === "red" ? "black" : "red");

function getAllValidMoves(gameState: GameStateType) {
  const validations = gameState.pieces
    .flatMap((piece, idx) => {
      if (!piece) return [];
      const rowDirection = piece === "red" ? -1 : 1;
      const { row, col } = idxToPosition(idx);
      return [
        { row: row + rowDirection, col: col + 1 },
        { row: row + rowDirection, col: col - 1 },
        { row: row + rowDirection * 2, col: col + 2 },
        { row: row + rowDirection * 2, col: col - 2 },
      ].map((pos) =>
        validateMove({ fromIdx: idx, toIdx: positionToIdx(pos), gameState })
      );
    })
    .filter((v) => v);
  const eats = validations.filter((v) => v?.eat !== undefined);
  if (eats.length > 0) return eats;
  return validations;
}

function validateMove({
  fromIdx,
  toIdx,
  gameState,
}: {
  fromIdx: number;
  toIdx: number;
  gameState: GameStateType;
}) {
  // basic validation
  if (fromIdx === toIdx) return;
  if (toIdx === -1) return;

  const to = idxToPosition(toIdx);

  // only black squares allowed
  if (to.rem === 0) return;

  // can't land on a piece
  if (gameState.pieces[toIdx]) return;

  const from = { ...idxToPosition(fromIdx), piece: gameState.pieces[fromIdx] };

  // check turn
  if (from.piece !== gameState.turn) return;

  const rowDiff = to.row - from.row;

  // only move forward
  if (from.piece === "red" && rowDiff >= 0) return;
  if (from.piece === "black" && rowDiff <= 0) return;

  const colDiff = to.col - from.col;

  // only move diagonally
  if (Math.abs(rowDiff) !== Math.abs(colDiff)) return;

  // moving 1 is legal
  if (Math.abs(rowDiff) === 1) {
    return { valid: true, fromIdx, toIdx };
  }

  // don't move more than 2
  if (Math.abs(rowDiff) !== 2) return;

  const eat = positionToIdx({
    row: from.row + rowDiff / 2,
    col: from.col + colDiff / 2,
  });

  // no piece to eat
  if (gameState.pieces[eat] !== other(from.piece)) return;

  return { valid: true, fromIdx, toIdx, eat };
}
