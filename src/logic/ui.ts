import { createSignal } from "solid-js";

export const [dragXY, setDragXY] = createSignal<{ x: number; y: number }>();

export function xyIsInCell(
  { x, y }: { x: number; y: number },
  cell: HTMLDivElement
) {
  const { top, right, bottom, left } = cell.getBoundingClientRect();
  return x >= left && x <= right && y >= top && y <= bottom;
}
