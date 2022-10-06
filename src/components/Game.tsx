import { createSignal, For } from "solid-js";
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

  const pieces = Object.values(gameState.pieces);
  return (
    <div classList={{ "opacity-0": !opaque() }}>
      <div class="relative my-6 grid aspect-square h-[var(--board-size)] grid-cols-8 place-content-stretch bg-gradient-to-br from-white to-black shadow-md shadow-black">
        {cells}
        <For each={pieces}>
          {(piece) => (
            <Piece
              piece={piece}
              playTurn={playTurn}
              allValidMoves={allValidMoves()}
            />
          )}
        </For>
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
