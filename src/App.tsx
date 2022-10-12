import { createMemo, createSignal, For, onMount } from "solid-js";
import {
  newGame,
  other,
  PieceState,
  positionToIdx,
  ValidMove,
} from "./logic/game";
import { cellIdxForXY } from "./logic/ui";
import Cells from "./components/Cells";
import { ActionButtons } from "./components/ActionButtons";
import Piece from "./components/Piece";
import WinnerDialog from "./components/WinnerDialog";

export default function App() {
  let board: HTMLDivElement;

  const { gameState, allValidMoves, restartGame, playMove, undo, redo } =
    newGame();
  const gameOver = () => allValidMoves().length === 0;
  const validMovesByPieceId = createMemo(() =>
    allValidMoves().reduce((acc: (ValidMove[] | undefined)[], move) => {
      (acc[move.fromPiece.id] = acc[move.fromPiece.id] || []).push(move);
      return acc;
    }, new Array(24))
  );

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

  const playTurn = (fromPiece: PieceState) => {
    const hoveredCell = hoveredCellIdx();
    const move = allValidMoves().find(
      (v) =>
        v.fromPiece.id === fromPiece.id &&
        positionToIdx(v.toPos) === hoveredCell
    );
    if (move) playMove(move);
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
        <For each={gameState.pieces}>
          {(piece, i) => (
            <Piece
              piece={piece}
              hasValidMove={!!validMovesByPieceId()[i()]?.length}
              turn={gameState.turn}
              setDragXY={setDragXY}
              playTurn={playTurn}
            />
          )}
        </For>
      </div>
      <ActionButtons undo={undo} redo={redo} />
      <WinnerDialog
        winner={other(gameState.turn)}
        gameOver={gameOver()}
        restartGame={restartGame}
      />
    </div>
  );
}
