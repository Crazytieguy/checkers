import { ai, setAI } from "../logic/ai";

export default function AISwitch() {
  return (
    <div class="flex items-center gap-2">
      🧑
      <input
        type="checkbox"
        class="relative h-[1em] w-[2em] cursor-pointer appearance-none rounded-full bg-grey-medium transition-colors duration-200 after:absolute after:m-[0.1em] after:aspect-square after:h-[0.8em] after:rounded-full after:bg-grey-light after:transition-transform checked:bg-blue-light checked:after:translate-x-[1em]"
        onChange={() => setAI((v) => !v)}
        checked={ai()}
      />
      🤖
    </div>
  );
}
