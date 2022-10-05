import { createEffect } from "solid-js";
import type { playerSide } from "../logic/game";

export default function WinnerDialog(props: {
  winner: playerSide;
  gameOver: boolean;
  restartGame: () => void;
}) {
  let self: HTMLDialogElement;
  createEffect(() => {
    if (props.gameOver) {
      self.showModal();
    }
  });
  return (
    <dialog ref={self!} class="rounded-2xl">
      <h2 class="text-4xl font-bold">
        <span
          classList={{
            "text-red-600": props.winner === "red",
            "text-black": props.winner === "black",
          }}
        >
          {props.winner}
        </span>{" "}
        wins!
      </h2>
      <form class="mt-5" method="dialog">
        <button
          class="rounded-lg bg-violet-800 p-2 text-white shadow shadow-black"
          onClick={() => props.restartGame()}
        >
          Restart Game
        </button>
      </form>
    </dialog>
  );
}
