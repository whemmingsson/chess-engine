import type { Move } from "./Move";
import type { Piece, PieceClass } from "./Piece";

export type MoveMetaData = object & {
  enPassant?: boolean;
  casteling?: boolean;
  casteledRook?: Piece;
  promoteTo?: PieceClass;
  pieceMoved?: Piece;
};

export interface EnrichedMove extends Move {
  metadata?: MoveMetaData;
}
