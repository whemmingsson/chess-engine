import type { EnrichedMove } from "@chess-engine/common/models/EnrichedMove";
import type { PieceColor } from "@chess-engine/common/models/Piece";

export interface BotEngine {
  getAvailableMoves(color: PieceColor): EnrichedMove[];
}
