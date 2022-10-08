import { ai, setAI } from "../logic/ai";

export default function AISwitch() {
  let toggle: HTMLInputElement;
  return (
    <div class="flex items-center gap-2">
      🧑
      <input
        ref={toggle!}
        type="checkbox"
        class="relative h-[1em] w-[2em] appearance-none rounded-full bg-grey-medium transition-colors duration-200 after:absolute after:m-[0.1em] after:aspect-square after:h-[0.8em] after:rounded-full after:bg-grey-light after:transition-transform checked:bg-[#393] checked:after:translate-x-[1em] dark:after:bg-blue-medium"
        onChange={() => setAI((v) => !v)}
        checked={ai()}
      />
      🤖
    </div>
  );
}
