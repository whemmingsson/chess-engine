import { EnrichedMove } from "../../common/models/EnrichedMove";
import { RandummyV1 } from "../../chess-bots/src/bots/Randummy/v1/RandummyV1";
import { Bot } from "../../chess-bots/src/common/Bot";
import { Engine } from "./Engine";

/* Main component for running games vs bots */
export class Runner {
  engine: Engine;
  bot: Bot;

  constructor() {
    // Full access to game engine logic
    this.engine = new Engine();

    // Initial dummy bot
    this.bot = new RandummyV1(this.engine, "Black");
  }

  getEngine() {
    return this.engine;
  }

  // Invoke to execute a human move, followed by the bot move
  move(move: EnrichedMove) {
    // Might throw error if move is invalid
    this.engine.movePiece(move);

    // Let the bot find it's move
    const botMove = this.bot.getMove();

    // Perform the move
    this.engine.movePiece(botMove);
  }
}
