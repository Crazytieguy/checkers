import { createSignal, Index, Show } from "solid-js";
import { newGame, other } from "../logic/game";
import Cells from "./Cells";
import Piece from "./Piece";
import Turn from "./Turn";
import WinnerDialog from "./WinnerDialog";

export default function Game() {
  const cells = (<Cells />) as HTMLDivElement[];
  const [opaque, setOpaque] = createSignal(false);
  setTimeout(() => setOpaque(true));
  const { playTurn, gameState, allValidMoves, gameOver, restartGame } =
    newGame(cells);
  return (
    <div
      class="transition-opacity duration-1000"
      classList={{ "opacity-0": !opaque() }}
    >
      <div
        class="relative my-6 grid aspect-square grid-cols-8 place-content-stretch shadow-md shadow-black"
        style={{ height: "min(70vh, 70vw)" }}
      >
        {cells}
        <Show when={!gameOver()}>
          <Index each={gameState.pieces}>
            {(piece, idx) => (
              <Show when={piece()}>
                <Piece
                  hasValidMove={allValidMoves().some((v) => v?.fromIdx === idx)}
                  idx={idx}
                  side={piece()!}
                  playTurn={playTurn}
                />
              </Show>
            )}
          </Index>
        </Show>
      </div>
      <Turn turn={gameState.turn} />
      <WinnerDialog
        winner={other(gameState.turn)}
        gameOver={gameOver()}
        restartGame={restartGame}
      />
    </div>
  );
}
