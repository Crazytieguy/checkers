import { DragGesture } from "@use-gesture/vanilla";
import { createSignal, JSX, onCleanup, Show } from "solid-js";

export function Piece(props: {
  color: "red" | "black";
  row: number;
  col: number;
  disabled?: true;
}) {
  const [movement, setMovement] = createSignal([0, 0]);
  const transition = ([x, y]: number[]) =>
    x === 0 && y === 0 ? "transition-transform duration-75" : "";

  const piece = (
    <svg
      class={`absolute ${transition(movement())}`}
      style={{
        "grid-column": `${props.col + 1} / ${props.col + 1}`,
        "grid-row": `${props.row + 1} / ${props.row + 1}`,
        "touch-action": "none",
        transform: `translate(${movement()[0]}px, ${movement()[1]}px)`,
      }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="45" fill={props.color} />
      <circle
        fill="none"
        cx="50"
        cy="50"
        r="33"
        stroke="#ccc"
        stroke-width="3"
      />
    </svg>
  ) as JSX.Element & EventTarget;

  const gesture = new DragGesture(piece, ({ active, movement }) => {
    if (active) {
      setMovement(movement);
    } else {
      setMovement([0, 0]);
    }
  });

  onCleanup(() => {
    gesture.destroy();
  });

  return <Show when={!props.disabled}>{piece}</Show>;
}
