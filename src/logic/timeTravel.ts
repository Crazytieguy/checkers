type mutator = {
  doMove: () => void;
  undoMove: () => void;
};

export default function useTimeTravel() {
  const undoStack: mutator[] = [];
  const redoStack: mutator[] = [];
  const do_ = (m: mutator) => {
    undoStack.push(m);
    redoStack.length = 0;
    m.doMove();
  };
  const undo = () => {
    const lastMutator = undoStack.pop();
    if (!lastMutator) {
      return false;
    }
    redoStack.push(lastMutator);
    lastMutator.undoMove();
    return true;
  };
  const redo = () => {
    const lastMutator = redoStack.pop();
    if (!lastMutator) {
      return false;
    }
    undoStack.push(lastMutator);
    lastMutator.doMove();
    return true;
  };
  const reset = () => {
    undoStack.length = 0;
    redoStack.length = 0;
  };
  return { do_, undo, redo, reset };
}
