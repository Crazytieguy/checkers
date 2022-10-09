import { createSignal, For, onMount } from "solid-js";
import { newGame, other } from "../logic/game";
import { initBoardBox } from "../logic/ui";
import Cells from "./Cells";
import { ActionButtons } from "./ActionButtons";
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
    <div
      classList={{ "opacity-0": !opaque() }}
      class="transition-opacity duration-1000"
    >
      <div
        // pattern is recommended by solid
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ref={board!}
        class="relative my-4 grid h-[var(--board-size)] w-[var(--board-size)] grid-cols-8 place-content-stretch bg-gradient-to-br from-white to-black shadow-md shadow-black"
      >
        <Cells />
        <For each={gameState.pieces}>
          {(piece) => (
            <Piece piece={piece} turn={gameState.turn} playTurn={playTurn} />
          )}
        </For>
      </div>
      <ActionButtons undo={undo} />
      <WinnerDialog
        winner={other(gameState.turn)}
        gameOver={gameOver()}
        restartGame={restartGame}
      />
    </div>
  );
}
