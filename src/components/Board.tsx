import { cells } from "../logic/game";
import { Piece } from "./Piece";

export default function Board() {
  const initialBlackPieces = Array.from({ length: 12 }, (_, idx) => {
    const row = Math.floor(idx / 4);
    const col = (idx * 2 + 1 + row) % 8;
    return <Piece {...{ col, row, side: "black" }} />;
  });
  const initialRedPieces = Array.from({ length: 12 }, (_, idx) => {
    const row = Math.floor(idx / 4) + 5;
    const col = (idx * 2 + 1 + row) % 8;
    return <Piece {...{ col, row, side: "red" }} />;
  });
  return (
    <div
      class="relative grid aspect-square grid-cols-8 place-content-stretch"
      style={{ height: "min(70vh, 70vw)" }}
    >
      {cells}
      {initialBlackPieces}
      {initialRedPieces}
    </div>
  );
}
