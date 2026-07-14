import { Engine } from "../../../../../chess-engine/src/Engine";
import { EnrichedMove } from "../../../../../common/models/EnrichedMove";
import { PieceColor } from "../../../../../common/models/Piece";
import { Bot } from "../../../common/Bot";

export class RandummyV1 implements Bot {
  engine: Engine;
  color: PieceColor;
  /**
   *
   */
  constructor(engine: Engine, color: PieceColor) {
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
