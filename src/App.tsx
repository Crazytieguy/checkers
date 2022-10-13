import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
import { newGame, positionToIdx } from "./logic/game";
import { cellIdxForXY } from "./logic/ui";
import Cells from "./components/Cells";
import { ActionButtons } from "./components/ActionButtons";
import Piece from "./components/Piece";
import WinnerDialog from "./components/WinnerDialog";
import { ai, pickMove } from "./logic/ai";
import { groupBy } from "./logic/utils";

export default function App() {
  let board: HTMLDivElement;

  const game = newGame();
  const validMovesByPieceId = createMemo(() =>
    groupBy(game.allValidMoves, (m) => m.fromPiece.id)
  );
  const undo = () => {
    batch(() => {
      do {
        if (!game.undo()) break;
      } while (ai() && game.state.turn === "red");
    });
  };
  const redo = () => {
    batch(() => {
      do {
        if (!game.redo()) break;
      } while (ai() && game.state.turn === "red");
    });
  };
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "z") undo();
  });

  let aiTimeout: number;
  createEffect(() => {
    clearTimeout(aiTimeout);
    if (game.state.turn === "red" && ai()) {
      const move = pickMove(game.state);
      if (move) {
        setTimeout(() => game.play(move), 300);
      } else {
        console.error("AI was unable to pick a move");
      }
    }
  });

  const [opaque, setOpaque] = createSignal(false);
  onMount(() => {
    setOpaque(true);
  });

  const [dragXY, setDragXY] = createSignal<{ x: number; y: number }>();
  const hoveredCellIdx = () => {
    const xy = dragXY();
    if (xy) {
      return cellIdxForXY(xy, board);
    }
  };

  const play = (pieceId: number) => {
    const move = (validMovesByPieceId()[pieceId] || []).find(
      (v) => positionToIdx(v.toPos) === hoveredCellIdx()
    );
    if (move) game.play(move);
  };

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
        <Cells hoveredCellIdx={hoveredCellIdx()} />
        <For each={game.state.pieces}>
          {(piece, i) => (
            <Show when={piece.isInPlay}>
              <Piece
                piece={piece}
                hasValidMove={!!validMovesByPieceId()[i()]?.length}
                turn={game.state.turn}
                setDragXY={setDragXY}
                play={play}
              />
            </Show>
          )}
        </For>
      </div>
      <ActionButtons undo={undo} redo={redo} />
      <WinnerDialog winner={game.winner} restartGame={game.restart} />
    </div>
  );
}
