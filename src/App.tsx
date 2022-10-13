import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  Index,
  onMount,
  Show,
} from "solid-js";
import { CellStatus, cellStatus, newGame, PieceColor } from "./logic/game";
import { cellIdxForXY, cellIdxToBoardIdx } from "./logic/ui";
import Cells from "./components/Cells";
import { ActionButtons } from "./components/ActionButtons";
import Piece from "./components/Piece";
import WinnerDialog from "./components/WinnerDialog";
import { ai, pickMove } from "./logic/ai";
import { groupBy } from "./logic/utils";

export default function App() {
  let board: HTMLDivElement;

  const game = newGame();
  const validMovesByPieceIdx = createMemo(() =>
    groupBy(game.allValidMoves, (m) => m.from)
  );

  const aisTurn = () => ai() && game.state().turn === PieceColor.Red;
  const undo = () => {
    batch(() => {
      do {
        if (!game.undo()) break;
      } while (aisTurn());
    });
  };
  const redo = () => {
    batch(() => {
      do {
        if (!game.redo()) break;
      } while (aisTurn());
    });
  };
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "z") undo();
  });

  let aiTimeout: number;
  createEffect(() => {
    clearTimeout(aiTimeout);
    if (aisTurn()) {
      const move = pickMove(game.state());
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
    const move = (validMovesByPieceIdx()[pieceId] || []).find(
      (m) => m.to === cellIdxToBoardIdx(hoveredCellIdx())
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
        <Index each={Array.from(game.state().board)}>
          {(piece, i) => {
            const playLocal = () => play(i);
            return (
              <Show when={cellStatus(piece()) === CellStatus.Occupied}>
                <Piece
                  idx={i}
                  piece={piece()}
                  hasValidMove={!!validMovesByPieceIdx()[i]?.length}
                  turn={game.state().turn}
                  setDragXY={setDragXY}
                  play={playLocal}
                />
              </Show>
            );
          }}
        </Index>
      </div>
      <ActionButtons undo={undo} redo={redo} />
      <WinnerDialog winner={game.winner} restartGame={game.restart} />
    </div>
  );
}
