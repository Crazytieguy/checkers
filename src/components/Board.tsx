import { Index, Show } from "solid-js";
import { gameState, getPlayTurn } from "../logic/game";
import Cells from "./Cells";
import Piece from "./Piece";

export default function Board() {
  const cells = (<Cells />) as HTMLDivElement[];
  const playTurn = getPlayTurn(cells);
  return (
    <div
      class="relative grid aspect-square grid-cols-8 place-content-stretch"
      style={{ height: "min(70vh, 70vw)" }}
    >
      {cells}
      <Index each={gameState.pieces}>
        {(piece, idx) => (
          <Show when={piece()}>
            <Piece idx={idx} side={piece()!} playTurn={playTurn} />
          </Show>
        )}
      </Index>
    </div>
  );
}
