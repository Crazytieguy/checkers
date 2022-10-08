import { batch, createEffect, createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import { ai, pickMove } from "./ai";
import { hoveredCellIdx } from "./ui";

export type PlayerSide = "red" | "black";
type Position = {
  row: number;
  col: number;
  rem?: number;
};

export type PieceState = {
  id: number;
  side: PlayerSide;
  isKing: boolean;
  position: Position;
  isInPlay: boolean;
  hasValidMove: boolean;
};

type GameStateType = {
  turn: PlayerSide;
  inChainPieceId: number | null;
  pieces: PieceState[];
};

function initialState(): GameStateType {
  const pieceNumberToPos = Array.from({ length: 64 }, (_, idx) => {
    const { rem, row, col } = idxToPosition(idx);
    if (rem === 1 && row < 3) return [{ row, col }];
    if (rem === 1 && row > 4) return [{ row, col }];
    return [];
  }).flat();
  return {
    turn: "black",
    inChainPieceId: null,
    pieces: Array.from({ length: 24 }, (_, id) => ({
      side: id < 12 ? "red" : "black",
      position: pieceNumberToPos[id]!,
      isKing: false,
      isInPlay: true,
      hasValidMove: false,
      id,
    })),
  };
}

export function newGame() {
  const [gameState, setGameState] = createStore<GameStateType>(initialState());
  const allValidMoves = createMemo(() => getAllValidMoves(gameState));
  const gameOver = () => allValidMoves().length === 0;
  const restartGame = () => setGameState(initialState());

  createEffect(() => {
    batch(() => {
      const haveValidMoves = Array.from({ length: 24 }, () => false);
      // eslint-disable-next-line solid/reactivity
      allValidMoves().forEach((v) => (haveValidMoves[v.fromPiece.id] = true));
      haveValidMoves.forEach((hasValidMove, id) => {
        setGameState("pieces", id, "hasValidMove", hasValidMove);
      });
    });
  });

  let aiTimeout: number;

  createEffect(() => {
    clearTimeout(aiTimeout);
    if (gameState.turn === "red" && ai()) {
      const move = pickMove(allValidMoves());
      if (move !== undefined) {
        setTimeout(() => playMove(move), 100);
      } else {
        console.error("AI was unable to pick a move");
      }
    }
  });

  const playTurn = (fromPiece: PieceState) => {
    const hoveredCell = hoveredCellIdx();
    if (!hoveredCell) {
      console.error("Play turn without a hovered cell");
      return;
    }
    const selectedCellPos = idxToPosition(hoveredCell);
    // eslint-disable-next-line solid/reactivity
    const move = allValidMoves().find(
      (v) =>
        v.fromPiece.id === fromPiece.id &&
        positionToIdx(v.toPos) === positionToIdx(selectedCellPos)
    );
    if (move) playMove(move);
  };

  const playMove = ({ fromPiece, toPos, eat }: ValidMove) => {
    batch(() => {
      setGameState("pieces", fromPiece.id, "position", toPos);
      if (
        (fromPiece.side === "black" && toPos.row === 0) ||
        (fromPiece.side === "red" && toPos.row === 7)
      ) {
        setGameState("pieces", fromPiece.id, "isKing", true);
      }
      if (eat !== undefined) {
        setGameState("pieces", eat.id, "isInPlay", false);
        setGameState("inChainPieceId", fromPiece.id);
        if (allValidMoves().length === 0) {
          setGameState("inChainPieceId", null);
          setGameState("turn", other);
        }
      } else {
        setGameState("turn", other);
      }
    });
  };
  return { gameState, gameOver, restartGame, playTurn };
}

export function idxToPosition(idx: number) {
  const row = Math.floor(idx / 8);
  const rem = (idx + row) % 2;
  const col = idx % 8;
  return { rem, row, col };
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
  valid: true;
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
  if (toPos.rem === 0) return;

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
    return { valid: true, fromPiece, toPos };
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

  return { valid: true, fromPiece, toPos, eat };
}
