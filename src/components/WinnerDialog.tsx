import { createEffect, onMount } from "solid-js";
import type { PlayerSide } from "../logic/game";
import dialogPolyfill from "dialog-polyfill";
import "dialog-polyfill/dist/dialog-polyfill.css";

export default function WinnerDialog(props: {
  winner: PlayerSide | undefined;
  restartGame: () => void;
}) {
  let self: HTMLDialogElement;
  createEffect(() => {
    if (props.winner) {
      self.showModal();
    }
  });
  onMount(() => dialogPolyfill.registerDialog(self));
  return (
    <dialog
      // Pattern recommended by solid
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
