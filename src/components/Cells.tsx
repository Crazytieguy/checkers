import { createMemo } from "solid-js";

export default function Cells(props: { hoveredCellIdx: number | undefined }) {
  const isHovering = () => props.hoveredCellIdx !== undefined;
  return Array.from({ length: 64 }, (_, idx) => {
    const isPlaySquare = (idx + Math.floor(idx / 8)) % 2 === 1;
    const isDraggedOver = createMemo(() => props.hoveredCellIdx === idx);
    return (
      <div
        class="opacity-75 transition-colors"
        classList={{
          "duration-1000": !isHovering(),
          "duration-150": isHovering(),
          "bg-blue-medium": isDraggedOver(),
          "bg-grey-light": !isPlaySquare && !isDraggedOver(),
          "bg-grey-medium": isPlaySquare && !isDraggedOver(),
          "dark:bg-grey-dark": !isPlaySquare && !isDraggedOver(),
        }}
      />
    );
  });
}
