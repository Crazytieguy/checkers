import type { playerSide } from "../logic/game";

export default function PieceSVG(props: {
  side: playerSide;
  col: number;
  row: number;
  hasValidMove: boolean;
  movement: { x: number; y: number };
}) {
  const transX = () => (props.hasValidMove ? props.movement.x : 0),
    transY = () => (props.hasValidMove ? props.movement.y : 0);
  const movementIsZero = () => props.movement.x === 0 && props.movement.y === 0;
  return (
    <svg
      classList={{
        "transition-transform": movementIsZero(),
        "transition-none": !movementIsZero(),
        "duration-75": movementIsZero(),
        "drop-shadow-highlight": props.hasValidMove && movementIsZero(),
      }}
      class="absolute"
      style={{
        "grid-column": `${props.col} / ${props.col}`,
        "grid-row": `${props.row} / ${props.row}`,
        "touch-action": "none",
        transform: `translate(${transX()}px, ${transY()}px)`,
      }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 100 100"
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        classList={{
          "fill-red": props.side === "red",
          "fill-black": props.side === "black",
        }}
      />
      <circle
        fill="none"
        cx="50"
        cy="50"
        r="33"
        stroke="#ccc"
        stroke-width="3"
      />
    </svg>
  );
}
