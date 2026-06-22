import { Move } from "../../common/models/Move";
import { PieceClass } from "../../common/models/Piece";
import { Board } from "./types/Board";
import { toPosition } from "./utils/ConversionUtils";
import { generators } from "./ValidTargetCellsGenerators";

type pieceMoveValidatorFunc = (
  move: Move,
  board: Board,
  history?: Move[],
) => boolean;

export type validatorsType = Record<PieceClass, pieceMoveValidatorFunc>;

const validateMoveFor = (
  pieceClass: PieceClass,
  move: Move,
  board: Board,
  history?: Move[],
) => {
  const { source, target } = move;

  const targetCells = generators[pieceClass].generate(
    toPosition(source),
    board,
    history,
  );
  const isValidMove = targetCells.some((p) => p === target);

  if (!isValidMove) {
    throw Error(`Invalid move for ${pieceClass}`);
  }

  return true;
};

//Validators
export const validators: validatorsType = {
  Pawn: (m, b, h) => {
    return validateMoveFor("Pawn", m, b, h);
  },
  Rook: (m, b) => {
    return validateMoveFor("Rook", m, b);
  },
  King: (m, b) => {
    return validateMoveFor("King", m, b);
  },
  Queen: (m, b) => {
    return validateMoveFor("Queen", m, b);
  },
  Bishop: (m, b) => {
    return validateMoveFor("Bishop", m, b);
  },
  Knight: (m, b) => {
    return validateMoveFor("Knight", m, b);
  },
};
