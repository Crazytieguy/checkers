import type { playerSide } from "../logic/game";

export default function Turn(props: { turn: playerSide }) {
  return (
    <h2 class="text-2xl">
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
