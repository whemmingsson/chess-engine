"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandummyV1 = void 0;
class RandummyV1 {
    engine;
    color;
    /**
     *
     */
    constructor(engine, color) {
        this.engine = engine;
        this.color = color;
    }
    getMove() {
        const moves = this.engine.getAvailableMoves(this.color);
        // This is check mate!
        if (moves.length === 0) {
            throw new Error("Randummy: It seems you won. GG!");
        }
        const randomPosition = Math.floor(Math.random() * moves.length);
        return moves[randomPosition];
    }
}
exports.RandummyV1 = RandummyV1;
