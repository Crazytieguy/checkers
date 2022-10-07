import { createMemo } from "solid-js";
import { idxToPosition } from "../logic/game";
import { hoveredCellIdx } from "../logic/ui";

export default function Cells() {
  const isHovering = () => hoveredCellIdx() !== undefined;
  return Array.from({ length: 64 }, (_, idx) => {
    const { rem } = idxToPosition(idx);
    const isDraggedOver = createMemo(() => hoveredCellIdx() === idx);
    return (
      <div
        class="opacity-75 transition-colors"
        classList={{
          "duration-1000": !isHovering(),
          "duration-150": isHovering(),
          "bg-blue-medium": isDraggedOver(),
          "bg-grey-light": rem === 0 && !isDraggedOver(),
          "bg-grey-medium": rem === 1 && !isDraggedOver(),
          "dark:bg-grey-dark": rem === 0 && !isDraggedOver(),
        }}
      />
    );
  });
}
