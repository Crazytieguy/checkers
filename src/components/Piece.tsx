import { DragGesture } from "@use-gesture/vanilla";
import { createSignal, onCleanup, Show } from "solid-js";
import { cells, playerSide, setSelected, turn } from "../logic/game";

export function Piece(props: {
  side: playerSide;
  row: number;
  col: number;
  disabled?: true;
}) {
  const [movement, setMovement] = createSignal([0, 0]);
  const movementIsZero = () => movement()[0] === 0 && movement()[1] === 0;
  const allowedToMove = () => props.side === turn();

  const piece = (
    <svg
      classList={{
        "transition-transform": movementIsZero(),
        "duration-75": movementIsZero(),
      }}
      class="absolute"
      style={{
        "grid-column": `${props.col + 1} / ${props.col + 1}`,
        "grid-row": `${props.row + 1} / ${props.row + 1}`,
        "touch-action": "none",
        transform: allowedToMove()
          ? `translate(${movement()[0]}px, ${movement()[1]}px)`
          : "",
      }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="45" fill={props.side} />
      <circle
        fill="none"
        cx="50"
        cy="50"
        r="33"
        stroke="#ccc"
        stroke-width="3"
      />
    </svg>
  ) as SVGElement;

  const gesture = new DragGesture(piece, ({ active, movement, xy }) => {
    const [x, y] = xy;
    if (active && allowedToMove()) {
      const selectedIdx = cells.findIndex((cell) => {
        const { top, right, bottom, left } = cell.getBoundingClientRect();
        return x >= left && x <= right && y >= top && y <= bottom;
      });
      setSelected(selectedIdx);
      setMovement(movement);
    } else {
      setSelected(-1);
      setMovement([0, 0]);
    }
  });

  onCleanup(() => {
    gesture.destroy();
  });

  return <Show when={!props.disabled}>{piece}</Show>;
}
