import { EnrichedMove } from "@chess-engine/common/models/EnrichedMove";
import { RandummyV1 } from "@chess-engine/chess-bots/bots/Randummy/v1/RandummyV1";
import { Bot } from "@chess-engine/chess-bots/common/Bot";
import { Engine } from "./Engine";

/* Main component for running games vs bots */
export class Runner {
  engine: Engine;
  bot: Bot;

  constructor(engine: Engine = new Engine()) {
    this.engine = engine;
    this.bot = this._createBot(engine);
  }

  private _createBot(engine: Engine) {
    // Initial dummy bot
    return new RandummyV1(engine, "Black");
  }

  getEngine() {
    return this.engine;
  }

  setEngine(engine: Engine) {
    this.engine = engine;
    this.bot = this._createBot(engine);
  }

  reset() {
    this.setEngine(new Engine());
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
