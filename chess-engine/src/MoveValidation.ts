import { Move } from "../../common/models/Move";
import { nameOf, Piece, PieceColor } from "../../common/models/Piece";
import { toPosition } from "./utils/ConversionUtils";

export const isMoveObjectValid = (move: Move) => {
  if (!move.source) {
    throw Error("Source cell not provided");
  }

  if (!move.target) {
    throw Error("Target cell not provided");
  }

  if (move.source === move.target) {
    throw Error("Source and target are the same cell");
  }

  const s = toPosition(move.source);
  const t = toPosition(move.target);

  if (s.column < 1 || s.column > 8 || s.row < 1 || s.row > 8) {
    throw Error(`Source cell at ${move.source} is out of bounds`);
  }

  if (t.column < 1 || t.column > 8 || t.row < 1 || t.row > 8) {
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
  /* This method does the trivial checks that are piece agnostic*/

  const piece = sourcePiece;

  // No piece violation test
  if (!piece) {
    throw Error(`Not a piece at: ${move.source}`);
  }

  // Color violation test
  if (!disablePlayOrder && piece.color !== colorToMove) {
    throw Error(`It is ${colorToMove}'s turn to move`);
  }

  const pieceAtTargetCell = targetPiece;

  // Target piece of same color violation test
  if (pieceAtTargetCell && pieceAtTargetCell.color === piece.color) {
    throw Error(
      `Piece at target cell ${move.target} - ${nameOf(pieceAtTargetCell)} has the same color as piece to be moved - ${nameOf(piece)}`,
    );
  }

  return true;
};
