import { EnrichedMove } from "../../../common/models/EnrichedMove";

export abstract class Bot {
  abstract getMove(): EnrichedMove;
}
