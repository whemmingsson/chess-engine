import { Move } from "../../common/models/Move";
import { nameOf, Piece, PieceColor } from "../../common/models/Piece";
import { InternalMove } from "./types/InternalMove";
import { Position } from "./types/Position";
import { toPosition } from "./utils/ConversionUtils";

const isOutOfBounds = (pos: Position) => {
  return pos.column < 1 || pos.column > 8 || pos.row < 1 || pos.row > 8;
};

export const isMoveObjectValid = (move: InternalMove) => {
  if (!move.source) {
    throw Error("Source cell not provided");
  }

  if (!move.target) {
    throw Error("Target cell not provided");
  }

  if (move.source === move.target) {
    throw Error("Source and target are the same cell");
  }

  if (isOutOfBounds(move.sourcePosition)) {
    throw Error(`Source cell at ${move.source} is out of bounds`);
  }

  if (isOutOfBounds(move.targetPosition)) {
    throw Error(`Target cell at ${move.target} is out of bounds`);
  }

  return true;
};

export const canPieceMove = (
  move: Move,
  sourcePiece: Piece | null,
  targetPiece: Piece | null,
  colorToMove: PieceColor,
  disablePlayOrder: boolean,
) => {
  if (!sourcePiece) {
    throw Error(`Not a piece at: ${move.source}`);
  }

  if (!disablePlayOrder && sourcePiece.color !== colorToMove) {
    throw Error(`It is ${colorToMove}'s turn to move`);
  }

  const pieceAtTargetCell = targetPiece;

  if (pieceAtTargetCell && pieceAtTargetCell.color === sourcePiece.color) {
    throw Error(
      `Piece at target cell ${move.target} - ${nameOf(pieceAtTargetCell)} has the same color as piece to be moved - ${nameOf(sourcePiece)}`,
    );
  }

  return true;
};
