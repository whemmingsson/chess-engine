import {
  EnrichedMove,
  MoveMetaData,
} from "../../../common/models/EnrichedMove";
import { Move } from "../../../common/models/Move";
import { PieceColor } from "../../../common/models/Piece";
import { Position } from "../types/Position";

export const toPosition = (cell: String): Position => {
  if (cell.length !== 2) {
    throw Error(`Invalid cell ${cell}`);
  }
  const c = cell.split("");
  return {
    row: Number.parseInt(c[1]!),
    column: c[0]!.charCodeAt(0) - 64,
  };
};

export const toCell = (position: Position): string => {
  const { row, column } = position;
  return `${String.fromCharCode(column + 64)}${row}`;
};

export const otherColor = (color: PieceColor): PieceColor => {
  return color === "White" ? "Black" : "White";
};

export const enrichMove = (m: Move, metadata?: MoveMetaData): EnrichedMove => {
  return { ...m, metadata };
};
