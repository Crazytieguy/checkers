import { DragGesture } from "@use-gesture/vanilla";
import { batch, createSignal, onCleanup, Show } from "solid-js";
import type { newGame, PieceState, PlayerSide } from "../logic/game";
import { setDragXY } from "../logic/ui";
import PieceSVG from "./PieceSVG";

export default function Piece(props: {
  piece: PieceState;
  playTurn: ReturnType<typeof newGame>["playTurn"];
  turn: PlayerSide;
}) {
  const [movement, setMovement] = createSignal({ x: 0, y: 0 });

  const piece = (
    <PieceSVG piece={props.piece} turn={props.turn} movement={movement()} />
  ) as SVGElement;

  const gesture = new DragGesture(
    piece,
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

  onCleanup(() => {
    gesture.destroy();
  });

  return <Show when={props.piece.isInPlay}>{piece}</Show>;
}
