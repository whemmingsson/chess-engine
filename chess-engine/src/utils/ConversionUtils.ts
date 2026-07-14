import type {
  EnrichedMove,
  MoveMetaData,
} from "@chess-engine/common/models/EnrichedMove";
import type { Move } from "@chess-engine/common/models/Move";
import type { PieceColor } from "@chess-engine/common/models/Piece";
import type { InternalMove } from "../types/InternalMove";
import type { Position } from "../types/Position";

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

export const enrichMove = (
  m: Move | InternalMove,
  metadata?: MoveMetaData,
): EnrichedMove => {
  return { ...m, metadata };
};
