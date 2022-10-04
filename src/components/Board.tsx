import { Piece } from "./Piece";

export default function Board() {
  const cells = new Array(64).fill(undefined).map((_, idx) => {
    const row = Math.floor(idx / 8);
    const rem = (idx + row) % 2;
    return <div class={rem === 0 ? "bg-zinc-300" : "bg-zinc-500"} />;
  });
  const initialBlackPieces = new Array(12).fill(undefined).map((_, idx) => {
    const row = Math.floor(idx / 4);
    const col = (idx * 2 + 1 + row) % 8;
    return <Piece {...{ col, row, color: "black" }} />;
  });
  const initialRedPieces = new Array(12).fill(undefined).map((_, idx) => {
    const row = Math.floor(idx / 4) + 5;
    const col = (idx * 2 + 1 + row) % 8;
    return <Piece {...{ col, row, color: "red" }} />;
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
