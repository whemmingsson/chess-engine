import { EnrichedMove } from "@chess-engine/common/models/EnrichedMove";

export abstract class Bot {
  abstract getMove(): EnrichedMove;
}
