import type { PieceState, PlayerSide } from "../logic/game";
import { onCleanup, onMount, Show } from "solid-js";
import { ai } from "../logic/ai";
import { DragGesture } from "@use-gesture/vanilla";

export default function PieceSVG(props: {
  makeDragGesture: (ref: EventTarget) => DragGesture;
  turn: PlayerSide;
  piece: PieceState;
  movement: { x: number; y: number };
}) {
  const movementIsZero = () => props.movement.x === 0 && props.movement.y === 0;
  let ref: SVGSVGElement;
  let gesture: DragGesture;
  onMount(() => {
    gesture = props.makeDragGesture(ref);
  });
  onCleanup(() => gesture.destroy());
  return (
    <svg
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ref={ref!}
      classList={{
        "drop-shadow-highlight": props.piece.hasValidMove && movementIsZero(),
        "cursor-pointer": props.piece.hasValidMove,
        "z-10": !movementIsZero(),
        "opacity-80": !ai() && props.turn !== props.piece.side,
      }}
      class="absolute max-w-[calc(var(--board-size)/8)] touch-none transition-opacity duration-300"
      style={{
        "grid-column": `${props.piece.position.col + 1} / span 1`,
        "grid-row": `${props.piece.position.row + 1} / span 1`,
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
        cx="50"
        cy="50"
        r="33"
        class="fill-[none] stroke-grey-light stroke-2"
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
          class="fill-[none] stroke-grey-light stroke-2"
        />
      </Show>
    </svg>
  );
}
