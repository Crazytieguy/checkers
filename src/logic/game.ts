import { createStore } from "solid-js/store";
import { xyIsInCell } from "./ui";

export type playerSide = "red" | "black";

export const [gameState, setGameState] = createStore<{
  turn: playerSide;
  pieces: (playerSide | undefined)[];
}>({
  turn: "black",
  pieces: Array.from({ length: 64 }, (_, idx) => {
    const row = Math.floor(idx / 8);
    const rem = (idx + row) % 2;
    if (rem === 1 && row < 3) return "black";
    if (rem === 1 && row > 4) return "red";
    return undefined;
  }),
});

export function getPlayTurn(cells: HTMLDivElement[]) {
  return (pieceIdx: number, xy: { x: number; y: number }) => {
    const selectedCellIdx = cells.findIndex((cell) => xyIsInCell(xy, cell));
    console.log(`moving from ${pieceIdx} to ${selectedCellIdx}`);
  };
}
