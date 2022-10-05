export default function PieceSVG(props: {
  color: string;
  animate: boolean;
  col: number;
  row: number;
  transX: number;
  transY: number;
}) {
  return (
    <svg
      classList={{
        "transition-transform": props.animate,
        "duration-75": props.animate,
      }}
      class="absolute"
      style={{
        "grid-column": `${props.col} / ${props.col}`,
        "grid-row": `${props.row} / ${props.row}`,
        "touch-action": "none",
        transform: `translate(${props.transX}px, ${props.transY}px)`,
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
