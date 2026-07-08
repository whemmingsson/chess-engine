import { EnrichedMove } from "../../common/models/EnrichedMove";
import { Move } from "../../common/models/Move";
import { Board } from "./Board";
import { MoveClass } from "./types/MoveClass";
import { toPosition } from "./utils/ConversionUtils";

const isEnPassantMove = (move: EnrichedMove) => {
  if (move.metadata?.pieceMoved?.class !== "Pawn") {
    return false;
  }

  const s = toPosition(move.source);
  const t = toPosition(move.target);
  const isDiagonalMove =
    Math.abs(s.column - t.column) === 1 && Math.abs(s.row - t.row) === 1;

  if (!isDiagonalMove) {
    return false;
  }

  const isTargetEmpty = !move.metadata?.pieceTargeted;

  return isTargetEmpty;
};

const isPromotionMove = (move: EnrichedMove) => {
  if (move.metadata?.pieceMoved?.class !== "Pawn") {
    return false;
  }

  const targetPosition = toPosition(move.target);

  return targetPosition.row === 1 || targetPosition.row === 8;
};

const isCastelingMove = (move: EnrichedMove) => {
  const movingPiece = move.metadata?.pieceMoved;
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

export const classifyMove = (move: EnrichedMove): MoveClass => {
  if (isEnPassantMove(move)) {
    return "EnPassant";
  }

  if (isPromotionMove(move)) {
    return "Promotion";
  }

  if (isCastelingMove(move)) {
    return "Casteling";
  }

  return "Default";
};
