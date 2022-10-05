export default function PieceSVG(props: {
  color: string;
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
        "duration-75": movementIsZero(),
        "drop-shadow-[0_0_1.5px_yellow]":
          props.hasValidMove && movementIsZero(),
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
  );
}
