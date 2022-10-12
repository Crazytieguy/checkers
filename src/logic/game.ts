import { batch, createEffect, createMemo } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { ai, pickMove } from "./ai";
import useTimeTravel from "./timeTravel";

export type PlayerSide = "red" | "black";
type Position = {
  row: number;
  col: number;
};

export type PieceState = {
  id: number;
  side: PlayerSide;
  isKing: boolean;
  position: Position;
  isInPlay: boolean;
};

export type GameStateType = {
  turn: PlayerSide;
  inChainPieceId: number | null;
  pieces: PieceState[];
};

export function playSquare({ row, col }: Position) {
  return (row + col) % 2 === 1;
}

function idToInitialPosition(id: number) {
  const row = Math.floor(id / 4) + (id < 12 ? 0 : 2);
  const col = ((id * 2) % 8) + (row % 2 === 0 ? 1 : 0);
  return { row, col };
}

function initialState(): GameStateType {
  return {
    turn: "black",
    inChainPieceId: null,
    pieces: Array.from({ length: 24 }, (_, id) => ({
      get side() {
        return id < 12 ? "red" : "black";
      },
      position: idToInitialPosition(id),
      isKing: false,
      isInPlay: true,
      hasValidMove: false,
      get id() {
        return id;
      },
    })),
  };
}

export function newGame() {
  const [gameState, setGameState] = createStore<GameStateType>(initialState());
  const allValidMoves = createMemo(() => getAllValidMoves(gameState));
  const timeTravel = useTimeTravel();
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "z") timeTravel.undo();
  });
  const restartGame = () => {
    timeTravel.reset();
    setGameState(initialState());
  };
  const undo = () => {
    batch(() => {
      do {
        if (!timeTravel.undo()) break;
      } while (ai() && gameState.turn === "red");
    });
  };
  const redo = () => {
    batch(() => {
      do {
        if (!timeTravel.redo()) break;
      } while (ai() && gameState.turn === "red");
    });
  };
  document.onkeydown = (e) => {
    if (e.ctrlKey && e.key === "z") undo();
  };

  let aiTimeout: number;

  createEffect(() => {
    clearTimeout(aiTimeout);
    if (gameState.turn === "red" && ai()) {
      const move = pickMove(allValidMoves());
      if (move !== undefined) {
        setTimeout(() => playMove(move), 300);
      } else {
        console.error("AI was unable to pick a move");
      }
    }
  });

  const playMove = (move: ValidMove) => {
    const mutators = getValidMoveMutators(move, gameState);
    timeTravel.do_({
      doMove() {
        setGameState(produce(mutators.doMove));
      },
      undoMove() {
        setGameState(produce(mutators.undoMove));
      },
    });
  };
  return { gameState, allValidMoves, restartGame, playMove, undo, redo };
}

function getValidMoveMutators(
  { fromPiece, toPos, eat }: ValidMove,
  currentState: GameStateType
): {
  doMove: (gameState: GameStateType) => void;
  undoMove: (gameState: GameStateType) => void;
} {
  const { row, col } = fromPiece.position;
  const isKing = fromPiece.isKing;
  const inChainPieceId = currentState.inChainPieceId;
  const turn = currentState.turn;
  const unDoMove = (gameState: GameStateType) => {
    const piece = gameState.pieces[fromPiece.id];
    if (!piece) {
      console.error("piece id out of bounds", { fromPiece, gameState });
      return;
    }
    piece.position = { row, col };
    piece.isKing = isKing;
    if (eat) {
      const eatPiece = gameState.pieces[eat.id];
      if (!eatPiece) {
        console.error("eat id out of bounds", { eat, gameState });
        return;
      }
      eatPiece.isInPlay = true;
    }
    gameState.inChainPieceId = inChainPieceId;
    gameState.turn = turn;
  };
  const doMove = (gameState: GameStateType) => {
    const piece = gameState.pieces[fromPiece.id];
    if (!piece) {
      console.error("piece id out of bounds", { fromPiece, gameState });
      return;
    }
    piece.position = toPos;
    if (
      (fromPiece.side === "black" && toPos.row === 0) ||
      (fromPiece.side === "red" && toPos.row === 7)
    ) {
      piece.isKing = true;
    }
    if (eat) {
      const eatPiece = gameState.pieces[eat.id];
      if (!eatPiece) {
        console.error("eat id out of bounds", { eat, gameState });
        return;
      }
      eatPiece.isInPlay = false;
      gameState.inChainPieceId = fromPiece.id;
      if (getAllValidMoves(gameState).length === 0) {
        gameState.inChainPieceId = null;
        gameState.turn = other(gameState.turn);
      }
    } else {
      gameState.turn = other(gameState.turn);
    }
  };
  return {
    doMove,
    undoMove: unDoMove,
  };
}

export function positionToIdx({ row, col }: { row: number; col: number }) {
  if (row < 0 || row > 7 || col < 0 || col > 7) return -1;
  return row * 8 + col;
}

export const other = (p: PlayerSide) => (p === "red" ? "black" : "red");

function getAllValidMoves(gameState: GameStateType) {
  const idxToPiece: (PieceState | undefined)[] = new Array(64);
  const piecesArray = gameState.pieces.filter((p) => p.isInPlay);
  piecesArray.forEach((p) => (idxToPiece[positionToIdx(p.position)] = p));
  const inChainPiece =
    gameState.inChainPieceId === null
      ? undefined
      : gameState.pieces[gameState.inChainPieceId];
  const toCheck = inChainPiece ? [inChainPiece] : piecesArray;
  const validations = toCheck.flatMap((piece) => {
    const rowDirection = piece.side === "red" ? 1 : -1;
    const multipliers = piece.isKing ? [1, 2, -1, -2] : [1, 2];
    const possibleMoves = multipliers.flatMap((dist) =>
      [1, -1].map((colDirection) => ({
        row: piece.position.row + rowDirection * dist,
        col: piece.position.col + colDirection * dist,
      }))
    );
    return possibleMoves.flatMap((pos) => {
      const v = validateMove({
        fromPiece: piece,
        toPos: pos,
        turn: gameState.turn,
        idxToPiece,
      });
      if (v) return [v];
      return [];
    });
  });
  const eats = validations.filter((v) => v.eat);
  if (inChainPiece || eats.length > 0) return eats;
  return validations;
}

export type ValidMove = {
  fromPiece: PieceState;
  toPos: Position;
  eat?: PieceState;
};

function validateMove({
  fromPiece,
  toPos,
  turn,
  idxToPiece,
}: {
  fromPiece: PieceState;
  toPos: Position;
  turn: PlayerSide;
  idxToPiece: (PieceState | undefined)[];
}): ValidMove | undefined {
  const fromIdx = positionToIdx(fromPiece.position);
  const toIdx = positionToIdx(toPos);

  // basic validation
  if (fromIdx === toIdx) return;
  if (toIdx === -1) return;

  // only black squares allowed
  if (!playSquare(toPos)) return;

  // can't land on a piece
  if (idxToPiece[toIdx]) return;

  // check turn
  if (fromPiece?.side !== turn) return;

  const rowDiff = toPos.row - fromPiece.position.row;

  // only move forward
  if (!fromPiece.isKing) {
    if (fromPiece.side === "black" && rowDiff >= 0) return;
    if (fromPiece.side === "red" && rowDiff <= 0) return;
  }

  const colDiff = toPos.col - fromPiece.position.col;

  // only move diagonally
  if (Math.abs(rowDiff) !== Math.abs(colDiff)) return;

  // moving 1 is legal
  if (Math.abs(rowDiff) === 1) {
    return { fromPiece, toPos };
  }

  // don't move more than 2
  if (Math.abs(rowDiff) !== 2) return;

  const eat =
    idxToPiece[
      positionToIdx({
        row: fromPiece.position.row + rowDiff / 2,
        col: fromPiece.position.col + colDiff / 2,
      })
    ];

  // no piece to eat
  if (eat?.side !== other(fromPiece.side)) return;

  return { fromPiece, toPos, eat };
}
