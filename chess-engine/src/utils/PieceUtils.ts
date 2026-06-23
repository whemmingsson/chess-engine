import { pieceDefinitionMap } from "../../../common/config/board-config";
import { Piece, PieceClass, PieceColor } from "../../../common/models/Piece";

export const createNewPieceOfClass = (
  pieceClass: PieceClass,
  pieceColor: PieceColor,
): Piece => {
  return {
    ...pieceDefinitionMap[pieceClass],
    color: pieceColor,
  };
};
