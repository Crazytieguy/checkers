import { gameState } from "../logic/game";

export default function Turn() {
  return (
    <h2 class="text-2xl">
      Turn:{" "}
      <span
        class="inline-block"
        classList={{
          "text-red-600": gameState.turn === "red",
          "text-black": gameState.turn === "black",
        }}
      >
        {gameState.turn}
      </span>
    </h2>
  );
}
