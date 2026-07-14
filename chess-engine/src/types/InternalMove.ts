import type { EnrichedMove } from "@chess-engine/common/models/EnrichedMove";
import { toPosition } from "../utils/ConversionUtils";
import type { Position } from "./Position";

interface InternalMovePositions {
  // Internal representations as Positions rather than string cell key
  sourcePosition: Position;
  targetPosition: Position;
}

export type InternalMove = EnrichedMove & InternalMovePositions;

export const extendWithPositions = (move: EnrichedMove): InternalMove => {
  return {
    ...move,
    sourcePosition: toPosition(move.source),
    targetPosition: toPosition(move.target),
  } as InternalMove;
};
