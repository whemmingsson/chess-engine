import { Piece } from "../models/Piece";

export const hasPieceMoved = (
  piece: Piece | null,
  movedPieces?: Set<string>,
) => {
  if (!piece) {
    return false;
  }

  if (!movedPieces) {
    return false;
  }

  return movedPieces.has(piece.id);
};
