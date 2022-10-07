import { createEffect, createSignal } from "solid-js";
import { positionToIdx } from "./game";

export const [dragXY, setDragXY] = createSignal<{ x: number; y: number }>();
export const [boardBoundingBox, setBoardBoundingBox] = createSignal<DOMRect>();
export const [hoveredCellIdx, setHoveredCellIdx] = createSignal<
  number | undefined
>();

export function initBoardBox(board: HTMLDivElement) {
  const updateBoardBox = () =>
    setBoardBoundingBox(board.getBoundingClientRect());
  let timeout: number | undefined;
  window.onresize = () => {
    clearTimeout(timeout);
    timeout = setTimeout(updateBoardBox, 50);
  };
  updateBoardBox();
  createEffect(() => {
    let xy;
    if ((xy = dragXY())) {
      setHoveredCellIdx(cellIdxForXY(xy));
    } else {
      setHoveredCellIdx(undefined);
    }
  });
}

export function cellIdxForXY({ x, y }: { x: number; y: number }) {
  const boardBox = boardBoundingBox();
  if (!boardBox) {
    console.error("board bounding box not initialized");
    return;
  }
  const { top, bottom, left, right } = boardBox;
  const height = bottom - top;
  const width = right - left;
  const row = Math.floor((8 * (y - top)) / height);
  const col = Math.floor((8 * (x - left)) / width);
  return positionToIdx({ row, col });
}
