import { positionToIdx } from "./game";

export function cellIdxForXY(
  { x, y }: { x: number; y: number },
  board: HTMLDivElement
) {
  const { top, bottom, left, right } = board.getBoundingClientRect();
  const height = bottom - top;
  const width = right - left;
  const row = Math.floor((8 * (y - top)) / height);
  const col = Math.floor((8 * (x - left)) / width);
  return positionToIdx({ row, col });
}
