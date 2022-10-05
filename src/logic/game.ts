import { createStore } from "solid-js/store";
import { xyIsInCell } from "./ui";

export type playerSide = "red" | "black";

type GameStateType = {
  turn: playerSide;
  pieces: (playerSide | null | undefined)[];
};

export const [gameState, setGameState] = createStore<GameStateType>({
  turn: "black",
  pieces: Array.from({ length: 64 }, (_, idx) => {
    const { rem, row } = idxToPosition(idx);
    if (rem === 1 && row < 3) return "black";
    if (rem === 1 && row > 4) return "red";
    return null;
  }),
});

export function idxToPosition(idx: number) {
  const row = Math.floor(idx / 8);
  const rem = (idx + row) % 2;
  const col = idx % 8;
  return { rem, row, col };
}

function positionToIdx({ row, col }: { row: number; col: number }) {
  return row * 8 + col;
}

export function getPlayTurn(cells: HTMLDivElement[]) {
  return (pieceIdx: number, xy: { x: number; y: number }) => {
    const selectedCellIdx = cells.findIndex((cell) => xyIsInCell(xy, cell));
    const validation = validateMove({
      fromIdx: pieceIdx,
      toIdx: selectedCellIdx,
    });
    if (!validation?.valid) return;
    setTimeout(() => {
      setGameState("pieces", selectedCellIdx, gameState.pieces[pieceIdx]);
      setGameState("pieces", pieceIdx, null);
      if (validation.eat !== undefined) {
        setGameState("pieces", validation.eat, null);
      }
      setGameState("turn", gameState.turn === "red" ? "black" : "red");
    });
  };
}

function validateMove({ fromIdx, toIdx }: { fromIdx: number; toIdx: number }) {
  // basic validation
  if (fromIdx === toIdx) return;
  if (toIdx === -1) return;

  const to = idxToPosition(toIdx);

  // only black squares allowed
  if (to.rem === 0) return;

  // can't land on a piece
  if (gameState.pieces[toIdx]) return;

  const from = { ...idxToPosition(fromIdx), piece: gameState.pieces[fromIdx] };
  const rowDiff = to.row - from.row;

  // only move forward
  if (from.piece === "red" && rowDiff >= 0) return;
  if (from.piece === "black" && rowDiff <= 0) return;

  const colDiff = to.col - from.col;

  // only move diagonally
  if (Math.abs(rowDiff) !== Math.abs(colDiff)) return;

  // moving 1 is legal
  if (Math.abs(rowDiff) === 1) {
    return { valid: true };
  }

  // don't move more than 2
  if (Math.abs(rowDiff) !== 2) return;

  const eat = positionToIdx({
    row: from.row + rowDiff / 2,
    col: from.col + colDiff / 2,
  });

  // no piece to eat
  if (!gameState.pieces[eat]) return;

  return { valid: true, eat };
}
