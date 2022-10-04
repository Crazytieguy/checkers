import { Show } from "solid-js";

export function Piece(props: {
  color: "red" | "black";
  row: number;
  col: number;
  disabled?: true;
}) {
  return (
    <Show when={!props.disabled}>
      <svg
        class="absolute"
        style={{
          "grid-column": `${props.col + 1} / ${props.col + 1}`,
          "grid-row": `${props.row + 1} / ${props.row + 1}`,
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
    </Show>
  );
}
