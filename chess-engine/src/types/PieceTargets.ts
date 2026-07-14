import { Piece } from "@chess-engine/common/models/Piece";

export interface PieceTargets {
  piece: Piece | null;
  pieceCell: string;
  targetCells: string[];
}

export const areCellsTargeted = (
  allTargets: PieceTargets[] | undefined,
  cellsToLookup: string[],
) => {
  if (!allTargets) {
    return false;
  }
  return allTargets
    .flatMap((at) => at.targetCells)
    .some((tc) => cellsToLookup.includes(tc));
};
