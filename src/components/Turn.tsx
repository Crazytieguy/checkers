import type { PlayerSide } from "../logic/game";

export default function Turn(props: { turn: PlayerSide }) {
  return (
    <h2>
      Turn:{" "}
      <span
        class="inline-block"
        classList={{
          "text-red": props.turn === "red",
          "text-black": props.turn === "black",
        }}
      >
        ⬤
      </span>
    </h2>
  );
}
