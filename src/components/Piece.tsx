import { DragGesture } from "@use-gesture/vanilla";
import { onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { gameState, getPlayTurn, playerSide } from "../logic/game";
import { setDragXY } from "../logic/ui";
import PieceSVG from "./PieceSVG";

export default function Piece(props: {
  side: playerSide;
  idx: number;
  playTurn: ReturnType<typeof getPlayTurn>;
}) {
  const [movement, setMovement] = createStore({ x: 0, y: 0 });
  const allowedToMove = () => props.side === gameState.turn;

  const piece = (
    <PieceSVG
      row={Math.floor(props.idx / 8) + 1}
      col={(props.idx % 8) + 1}
      animate={movement.x === 0 && movement.y === 0}
      color={props.side}
      transX={allowedToMove() ? movement.x : 0}
      transY={allowedToMove() ? movement.y : 0}
    />
  ) as SVGElement;

  const gesture = new DragGesture(
    piece,
    ({ active, movement: [mx, my], xy: [x, y], cancel }) => {
      if (!allowedToMove()) {
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
