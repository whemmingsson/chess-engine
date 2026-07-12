import { Position } from "../../chess-engine/src/types/Position";
import { toPosition } from "../../chess-engine/src/utils/ConversionUtils";

export interface Move {
  // Part of the public API contract for defining a move
  source: string;
  target: string;
}
