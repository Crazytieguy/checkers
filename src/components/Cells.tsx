import { idxToPosition } from "../logic/game";
import { dragXY, xyIsInCell } from "../logic/ui";

export default function Cells() {
  return Array.from({ length: 64 }, (_, idx) => {
    let self: HTMLDivElement;
    const { rem } = idxToPosition(idx);
    const isDraggedOver = () => {
      const xy = dragXY();
      if (!xy) return false;
      return xyIsInCell(xy, self);
    };
    return (
      <div
        ref={self!}
        class="opacity-75"
        classList={{
          "bg-blue-medium": isDraggedOver(),
          "bg-grey-light": !isDraggedOver() && rem === 0,
          "bg-grey-medium": !isDraggedOver() && rem === 1,
          "dark:bg-grey-dark": !isDraggedOver() && rem === 0,
        }}
      />
    );
  });
}
