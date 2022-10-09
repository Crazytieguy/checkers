import { DragGesture } from "@use-gesture/vanilla";
import { batch, createSignal, Show } from "solid-js";
import type { newGame, PieceState, PlayerSide } from "../logic/game";
import { setDragXY } from "../logic/ui";
import PieceSVG from "./PieceSVG";

export default function Piece(props: {
  piece: PieceState;
  playTurn: ReturnType<typeof newGame>["playTurn"];
  turn: PlayerSide;
}) {
  const [movement, setMovement] = createSignal({ x: 0, y: 0 });

  const makeDragGesture = (ref: EventTarget) =>
    new DragGesture(
      ref,
      ({ active, movement: [mx, my], xy: [x, y], cancel }) => {
        if (!props.piece.hasValidMove) {
          cancel();
          return;
        }
        if (active) {
          batch(() => {
            setDragXY({ x, y });
            setMovement({ x: mx, y: my });
          });
          return;
        }
        batch(() => {
          props.playTurn(props.piece);
          setDragXY();
          setMovement({ x: 0, y: 0 });
        });
      }
    );

  return (
    <Show when={props.piece.isInPlay}>
      <PieceSVG
        piece={props.piece}
        makeDragGesture={makeDragGesture}
        turn={props.turn}
        movement={movement()}
      />
    </Show>
  );
}
