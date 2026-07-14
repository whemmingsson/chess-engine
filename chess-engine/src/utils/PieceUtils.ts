import {
  makeId,
  pieceDefinitionMap,
} from "@chess-engine/common/config/board-config";
import {
  Piece,
  PieceClass,
  PieceColor,
} from "@chess-engine/common/models/Piece";

export const createNewPieceOfClass = (
  pieceClass: PieceClass,
  pieceColor: PieceColor,
  sourceCell: string,
): Piece => {
  const shortClass = pieceDefinitionMap[pieceClass].shortClass;

  return {
    ...pieceDefinitionMap[pieceClass],
    color: pieceColor,
    id: makeId(sourceCell, pieceColor, shortClass),
  };
};
