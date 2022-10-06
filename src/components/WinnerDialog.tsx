import { createEffect } from "solid-js";
import type { PlayerSide } from "../logic/game";

export default function WinnerDialog(props: {
  winner: PlayerSide;
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
    <dialog
      ref={self!}
      class="rounded-2xl border border-black bg-blue-light dark:bg-grey-dark dark:text-grey-light"
    >
      <h2 class="text-4xl font-bold">
        <span
          classList={{
            "text-red": props.winner === "red",
          }}
        >
          {props.winner}
        </span>{" "}
        wins!
      </h2>
      <form class="mt-5" method="dialog">
        <button
          class="shadow-blac rounded-lg bg-gradient-to-br from-grey-light to-grey-medium p-2 shadow shadow-blue-medium dark:from-blue-medium dark:to-blue-dark dark:shadow-black"
          onClick={() => props.restartGame()}
        >
          Restart Game
        </button>
      </form>
    </dialog>
  );
}
