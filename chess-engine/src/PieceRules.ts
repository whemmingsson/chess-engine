import { Move } from "../../common/models/Move";
import { PieceClass } from "../../common/models/Piece";
import { Board } from "./types/Board";
import { toPosition } from "./utils/ConversionUtils";
import { generators } from "./ValidTargetCellsGenerators";

type pieceMoveValidatorFunc = (move: Move, board: Board) => boolean;

export type validatorsType = Record<PieceClass, pieceMoveValidatorFunc>;

const validateMoveFor = (move: Move, board: Board, pieceClass: PieceClass) => {
  const { source, target } = move;

  const targetCells = generators[pieceClass].generate(
    toPosition(source),
    board,
  );
  const isValidMove = targetCells.some((p) => p === target);

  if (!isValidMove) {
    throw Error(`Invalid move for ${pieceClass}`);
  }

  return true;
};

//Validators
export const validators: validatorsType = {
  Pawn: (m, b) => {
    return validateMoveFor(m, b, "Pawn");
  },
  Rook: (m, b) => {
    return validateMoveFor(m, b, "Rook");
  },
  King: (m, b) => {
    return validateMoveFor(m, b, "King");
  },
  Queen: (m, b) => {
    return validateMoveFor(m, b, "Queen");
  },
  Bishop: (m, b) => {
    return validateMoveFor(m, b, "Bishop");
  },
  Knight: (m, b) => {
    return validateMoveFor(m, b, "Knight");
  },
};
