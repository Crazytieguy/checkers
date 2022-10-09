import { createSignal, For, onMount } from "solid-js";
import { newGame, other } from "../logic/game";
import { initBoardBox } from "../logic/ui";
import AISwitch from "./AISwitch";
import Cells from "./Cells";
import Piece from "./Piece";
import WinnerDialog from "./WinnerDialog";

export default function Game() {
  let board: HTMLDivElement;
  const [opaque, setOpaque] = createSignal(false);

  onMount(() => {
    initBoardBox(board);
    setOpaque(true);
  });

  const { gameState, gameOver, restartGame, playTurn, undo } = newGame();

  return (
    <div classList={{ "opacity-0": !opaque() }}>
      <div
        // pattern is recommended by solid
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ref={board!}
        class="relative my-4 grid aspect-square w-[var(--board-size)] grid-cols-8 place-content-stretch bg-gradient-to-br from-white to-black shadow-md shadow-black"
      >
        <Cells />
        <For each={gameState.pieces}>
          {(piece) => (
            <Piece piece={piece} turn={gameState.turn} playTurn={playTurn} />
          )}
        </For>
      </div>
      <div class="flex justify-between text-2xl">
        <button
          class="rounded-md bg-grey-light px-2 text-black active:scale-95 dark:bg-blue-light"
          style={{ transition: "background-color 1s, transform 150ms" }}
          onClick={undo}
        >
          Undo
        </button>
        <AISwitch />
      </div>
      <WinnerDialog
        winner={other(gameState.turn)}
        gameOver={gameOver()}
        restartGame={restartGame}
      />
    </div>
  );
}
