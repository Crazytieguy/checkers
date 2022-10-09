import { ai, setAI } from "../logic/ai";

export function ActionButtons(props: { undo: () => void }) {
  return (
    <div class="mt-6 grid justify-start gap-4 text-2xl text-black sm:grid-flow-col sm:justify-between">
      <button
        class="w-24 rounded-md border border-blue-dark bg-blue-light py-2 transition duration-150 active:scale-95"
        onClick={() => props.undo()}
      >
        Undo
      </button>
      <button
        class="w-24 rounded-md border border-blue-dark py-2 transition duration-150 active:scale-95"
        aria-pressed={ai()}
        classList={{ "bg-blue-light": ai(), "bg-grey-medium": !ai() }}
        onClick={() => setAI((v) => !v)}
      >
        🤖
      </button>
    </div>
  );
}
