import { ai, setAI } from "../logic/ai";

export function ActionButtons(props: { undo: () => void; redo: () => void }) {
  return (
    <div class="mt-6 flex w-[var(--board-size)] flex-wrap justify-between gap-4 text-xl">
      <button
        class="w-20 rounded-md border border-blue-dark bg-grey-medium py-2 text-black transition-transform duration-150 active:scale-95"
        onClick={() => props.undo()}
      >
        Undo
      </button>
      <button
        class="w-20 rounded-md border border-blue-dark py-2 transition duration-150 active:scale-95"
        aria-pressed={ai()}
        classList={{ "bg-blue-light": ai(), "bg-grey-medium": !ai() }}
        onClick={() => setAI((v) => !v)}
      >
        🤖
      </button>
      <button
        class="w-20 rounded-md border border-blue-dark bg-grey-medium py-2 text-black transition-transform duration-150 active:scale-95"
        onClick={() => props.redo()}
      >
        Redo
      </button>
    </div>
  );
}
