import { DragGesture } from "@use-gesture/vanilla";
import { batch, createSignal, onCleanup, Show } from "solid-js";
import type { newGame, PieceState, Validation } from "../logic/game";
import { setDragXY } from "../logic/ui";
import PieceSVG from "./PieceSVG";

export default function Piece(props: {
  piece: PieceState;
  allValidMoves: Validation[];
  playTurn: ReturnType<typeof newGame>["playTurn"];
}) {
  const [movement, setMovement] = createSignal({ x: 0, y: 0 });
  const hasValidMove = () =>
    props.allValidMoves.some((v) => v.fromPiece.id === props.piece.id);

  const piece = (
    <PieceSVG
      piece={props.piece}
      hasValidMove={hasValidMove()}
      movement={movement()}
    />
  ) as SVGElement;

  const gesture = new DragGesture(
    piece,
    ({ active, movement: [mx, my], xy: [x, y], cancel }) => {
      if (!hasValidMove()) {
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
        props.playTurn(props.piece, { x, y });
        setDragXY(undefined);
        setMovement({ x: 0, y: 0 });
      });
    }
  );

  onCleanup(() => {
    gesture.destroy();
  });

  return <Show when={props.piece.show}>{piece}</Show>;
}
