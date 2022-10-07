import type { PieceState } from "../logic/game";
import { Show } from "solid-js";

export default function PieceSVG(props: {
  piece: PieceState;
  movement: { x: number; y: number };
}) {
  const movementIsZero = () => props.movement.x === 0 && props.movement.y === 0;
  return (
    <svg
      classList={{
        "drop-shadow-highlight": props.piece.hasValidMove && movementIsZero(),
        "z-10": !movementIsZero(),
      }}
      class="absolute touch-none"
      style={{
        "grid-column": `${props.piece.position.col + 1} / ${
          props.piece.position.col + 1
        }`,
        "grid-row": `${props.piece.position.row + 1} / ${
          props.piece.position.row + 1
        }`,
        transform: `translate(${props.movement.x}px, ${props.movement.y}px)`,
      }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        classList={{
          "fill-red": props.piece.side === "red",
          "fill-black": props.piece.side === "black",
        }}
      />
      <circle
        fill="none"
        cx="50"
        cy="50"
        r="33"
        class="stroke-grey-light stroke-2"
      />
      <Show when={props.piece.isKing}>
        <polyline
          points="
        30 63
        27 40
        40 48
        50 30
        60 48
        73 40
        70 63
        30 63"
          class="stroke-grey-light stroke-2"
          fill="none"
        />
      </Show>
    </svg>
  );
}
