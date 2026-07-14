import { EnrichedMove } from "@chess-engine/common/models/EnrichedMove";
import { PieceColor } from "@chess-engine/common/models/Piece";
import { Bot } from "../../../common/Bot";
import { BotEngine } from "../../../common/BotEngine";

export class RandummyV1 implements Bot {
  engine: BotEngine;
  color: PieceColor;
  /**
   *
   */
  constructor(engine: BotEngine, color: PieceColor) {
    this.engine = engine;
    this.color = color;
  }

  getMove(): EnrichedMove {
    const moves = this.engine.getAvailableMoves(this.color);

    // This is check mate!
    if (moves.length === 0) {
      throw new Error("Randummy: It seems you won. GG!");
    }

    const randomPosition = Math.floor(Math.random() * moves.length);
    return moves[randomPosition];
  }
}
