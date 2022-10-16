export function cellIdxForXY(
  { x, y }: { x: number; y: number },
  board: HTMLDivElement
) {
  const { top, bottom, left, right } = board.getBoundingClientRect();
  const height = bottom - top;
  const width = right - left;
  const row = Math.floor((8 * (y - top)) / height);
  const col = Math.floor((8 * (x - left)) / width);
  return row * 8 + col;
}

export function cellIdxToBoardIdx(cellIdx: number | undefined) {
  if (cellIdx === undefined) return;
  const row = Math.floor(cellIdx / 8);
  const col = cellIdx % 8;
  if ((col + row) % 2 === 0) return;
  return Math.floor(cellIdx / 2);
}
