import { createSignal, For, onMount } from "solid-js";
import { newGame, other } from "../logic/game";
import { initBoardBox } from "../logic/ui";
import AISwitch from "./AISwitch";
import Cells from "./Cells";
import Piece from "./Piece";
import Turn from "./Turn";
import WinnerDialog from "./WinnerDialog";

export default function Game() {
  let board: HTMLDivElement;
  const [opaque, setOpaque] = createSignal(false);

  onMount(() => {
    initBoardBox(board);
    setOpaque(true);
  });

  const { gameState, gameOver, restartGame, playTurn } = newGame();

  return (
    <div classList={{ "opacity-0": !opaque() }}>
      <div
        ref={board!}
        class="relative my-4 grid aspect-square h-[var(--board-size)] grid-cols-8 place-content-stretch bg-gradient-to-br from-white to-black shadow-md shadow-black"
      >
        <Cells />
        <For each={gameState.pieces}>
          {(piece) => <Piece {...piece} playTurn={playTurn} />}
        </For>
      </div>
      <div class="flex justify-between text-2xl">
        <Turn turn={gameState.turn} />
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
