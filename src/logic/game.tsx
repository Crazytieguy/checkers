import { createSignal } from "solid-js";

export type playerSide = "red" | "black";

export const [turn, setTurn] = createSignal<playerSide>("red");
export const [selected, setSelected] = createSignal(-1);

export const cells = Array.from({ length: 64 }, (_, idx) => {
  const row = Math.floor(idx / 8);
  const rem = (idx + row) % 2;
  const isSelected = () => selected() === idx;
  return (
    <div
      classList={{
        "bg-green-300": isSelected(),
        "bg-zinc-200": !isSelected() && rem === 0,
        "bg-zinc-500": !isSelected() && rem === 1,
      }}
    />
  );
}) as HTMLDivElement[];
