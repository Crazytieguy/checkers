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
        classList={{
          "bg-green-300": isDraggedOver(),
          "bg-zinc-200": !isDraggedOver() && rem === 0,
          "bg-zinc-500": !isDraggedOver() && rem === 1,
        }}
      />
    );
  });
}
