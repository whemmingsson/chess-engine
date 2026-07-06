import { EnrichedMove } from "../../common/models/EnrichedMove";
import { Move } from "../../common/models/Move";
import { Board } from "./Board";
import { MoveClass } from "./types/MoveClass";
import { toPosition } from "./utils/ConversionUtils";

const isEnPassantMove = (move: Move, board: Board) => {
  if (!board.isPieceClassAt("Pawn", move.source)) {
    return false;
  }

  const s = toPosition(move.source);
  const t = toPosition(move.target);
  const isDiagonalMove =
    Math.abs(s.column - t.column) === 1 && Math.abs(s.row - t.row) === 1;

  if (!isDiagonalMove) {
    return false;
  }

  const isTargetEmpty = !board.getPieceAtCell(move.target);

  return isTargetEmpty;
};

const isPromotionMove = (move: Move, board: Board) => {
  if (!board.isPieceClassAt("Pawn", move.source)) {
    return false;
  }

  const targetPosition = toPosition(move.target);

  return targetPosition.row === 1 || targetPosition.row === 8;
};

const isCastelingMove = (move: EnrichedMove, board: Board) => {
  const movingPiece = board.getPieceAtCell(move.source);
  if (!movingPiece) {
    return false;
  }

  if (movingPiece.class !== "King") {
    return false;
  }

  const sourcePos = toPosition(move.source);
  const targetPos = toPosition(move.target);

  if (sourcePos.row !== targetPos.row) {
    return false;
  }

  const moveLength = Math.abs(sourcePos.column - targetPos.column);

  return moveLength === 2;
};

export const classifyMove = (move: EnrichedMove, board: Board): MoveClass => {
  if (isEnPassantMove(move, board)) {
    return "EnPassant";
  }

  if (isPromotionMove(move, board)) {
    return "Promotion";
  }

  if (isCastelingMove(move, board)) {
    return "Casteling";
  }

  return "Default";
};
