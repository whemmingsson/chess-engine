import {
  makeId,
  pieceDefinitionMap,
} from "../../../common/config/board-config";
import { Piece, PieceClass, PieceColor } from "../../../common/models/Piece";

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
