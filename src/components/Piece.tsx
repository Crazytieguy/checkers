import { DragGesture } from "@use-gesture/vanilla";
import { onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { idxToPosition, newGame, playerSide } from "../logic/game";
import { setDragXY } from "../logic/ui";
import PieceSVG from "./PieceSVG";

export default function Piece(props: {
  side: playerSide;
  idx: number;
  hasValidMove: boolean;
  playTurn: ReturnType<typeof newGame>["playTurn"];
}) {
  const [movement, setMovement] = createStore({ x: 0, y: 0 });
  const pos = () => idxToPosition(props.idx);

  const piece = (
    <PieceSVG
      row={pos().row + 1}
      col={pos().col + 1}
      side={props.side}
      hasValidMove={props.hasValidMove}
      movement={movement}
    />
  ) as SVGElement;

  const gesture = new DragGesture(
    piece,
    ({ active, movement: [mx, my], xy: [x, y], cancel }) => {
      if (!props.hasValidMove) {
        cancel();
        return;
      }
      if (active) {
        setDragXY({ x, y });
        setMovement({ x: mx, y: my });
        return;
      }
      props.playTurn(props.idx, { x, y });
      setDragXY(undefined);
      setMovement({ x: 0, y: 0 });
    }
  );

  onCleanup(() => {
    gesture.destroy();
  });

  return piece;
}
