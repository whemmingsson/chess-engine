import type { Move } from "./Move";
import type { Piece, PieceClass } from "./Piece";

export type MoveMetaData = object & {
  enPassant?: boolean;
  casteling?: boolean;
  casteledRook?: Piece;
  promotion?: boolean;
  promoteTo?: PieceClass;
  pieceMoved?: Piece | null;
  pieceTargeted?: Piece | null;
};

export interface EnrichedMove extends Move {
  metadata?: MoveMetaData;
}
