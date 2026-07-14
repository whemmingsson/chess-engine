import {
  Piece,
  PieceClass,
  PieceColor,
} from "@chess-engine/common/models/Piece";
import { Engine } from "./Engine";
import { createNewPieceOfClass } from "./utils/PieceUtils";

export class EngineBuilder {
  board: Record<string, Piece | null>;

  /**
   *
   */
  constructor() {
    this.board = {};
  }

  _validate() {
    if (Object.values(this.board).length < 2) {
      throw Error("Board needs to have at least two pieces");
    }

    const pieces = Object.values(this.board).filter((p) => p !== null);
    const whitePieces = pieces.filter((p) => p.color === "White");
    const blackPieces = pieces.filter((p) => p.color === "Black");

    if (whitePieces.length < 1 || blackPieces.length < 1) {
      throw Error("Both black and white needs at least one piece");
    }

    const whiteKings = whitePieces.filter((p) => p.class === "King");
    const blackKings = blackPieces.filter((p) => p.class === "King");

    if (whiteKings.length < 1 || blackKings.length < 1) {
      throw Error("Both black and white needs at least one king each");
    }

    if (whitePieces.length === 1 && blackPieces.length === 1) {
      throw Error("A game of only two kings cannot be played");
    }
  }

  reset() {
    this.board = {};
    return this;
  }

  set(color: PieceColor, pieceClass: PieceClass, cell: string) {
    const piece = createNewPieceOfClass(pieceClass, color, cell);
    this.board[cell] = piece;
    return this;
  }

  build() {
    this._validate();
    return new Engine(this.board);
  }
}
