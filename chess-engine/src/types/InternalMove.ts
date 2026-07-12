import { EnrichedMove } from "../../../common/models/EnrichedMove";
import { Move } from "../../../common/models/Move";
import { toPosition } from "../utils/ConversionUtils";
import { Position } from "./Position";

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
