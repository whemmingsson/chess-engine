import type { Move } from "./Move";
import type { PieceClass } from "./Piece";

export type MoveMetaData = object & {
  enPassant?: boolean;
  promoteTo?: PieceClass;
};

export interface EnrichedMove extends Move {
  metadata?: MoveMetaData;
}
