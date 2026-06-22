import { pieceMap } from "../../common/config/board-config";
import { Move } from "../../common/models/Move";
import { nameOf, Piece, PieceColor } from "../../common/models/Piece";
import { config } from "./config/config";
import { validators } from "./PieceRules";
import { otherColor, toPosition } from "./utils/ConversionUtils";
import { generators } from "./ValidTargetCellsGenerators";

export class Engine {
  board: Record<string, Piece | null>;
  history: Move[];
  colorToMove: PieceColor;
  constructor() {
    console.log("Chess engine initialized");
    this.colorToMove = "White";
    this.board = {};
    this._initBoard();
    this.history = [];
  }

  _initBoard() {
    for (let i = 8; i >= 1; i--) {
      for (let j = 0; j < 8; j++) {
        const cellColLetter = String.fromCharCode(j + 65);
        const cellRowNumber = i;
        const cellKey = cellColLetter + cellRowNumber;
        const piece = pieceMap[cellKey];
        this.board[cellKey] = piece || null;
      }
    }
  }

  print() {
    console.log("Current board state: ", this.board);
    console.log(
      "Current history:",
      this.history.map((move) => move.source + " -> " + move.target).join("\n"),
    );
  }

  getPieceAtCell(cellKey: string): Piece | null {
    return this.board[cellKey] || null;
  }

  _isMoveObjectValid(move: Move) {
    if (!move.source) {
      throw Error("Source cell not provided");
    }

    if (!move.target) {
      throw Error("Target cell not provided");
    }

    if (move.source === move.target) {
      throw Error("Source and target are the same cell");
    }

    const s = toPosition(move.source);
    const t = toPosition(move.target);

    if (s.column < 1 || s.column > 8 || s.row < 1 || s.row > 8) {
      throw Error(`Source cell at ${move.source} is out of bounds`);
    }

    if (t.column < 1 || t.column > 8 || t.row < 1 || t.row > 8) {
      throw Error(`Target cell at ${move.target} is out of bounds`);
    }

    return true;
  }

  canPieceMove(move: Move) {
    /* This method does the trivial checks that are piece agnostic*/

    const piece = this.getPieceAtCell(move.source);

    // No piece violation test
    if (!piece) {
      throw Error(`Not a piece at: ${move.source}`);
    }

    // Color violation test
    if (!config.engine.disablePlayOrder && piece.color !== this.colorToMove) {
      throw Error(`It is ${this.colorToMove}'s turn to move`);
    }

    const pieceAtTargetCell = this.getPieceAtCell(move.target);

    // Target piece of same color violation test
    if (pieceAtTargetCell && pieceAtTargetCell.color === piece.color) {
      throw Error(
        `Piece at target cell ${move.target} - ${nameOf(pieceAtTargetCell)} has the same color as piece to be moved - ${nameOf(piece)}`,
      );
    }

    return true;
  }

  canSpecificPieceMove(move: Move) {
    // This validate piece-specific rules
    const piece = this.getPieceAtCell(move.source)!;
    return validators[piece.class](move, this.board, this.history);
  }

  movePiece(move: Move) {
    if (!this._isMoveObjectValid(move)) {
      return;
    }

    if (!this.canPieceMove(move)) {
      return;
    }

    if (!this.canSpecificPieceMove(move)) {
      return;
    }

    this.board[move.target] = this.getPieceAtCell(move.source);
    this.board[move.source] = null;
    this.colorToMove = otherColor(this.colorToMove);
    this.history.push(move);
  }

  getValidPositionsForPiece(source: string) {
    const piece = this.getPieceAtCell(source);

    // No piece violation test
    if (!piece) {
      return [];
    }

    return generators[piece.class].generate(
      toPosition(source),
      this.board,
      this.history,
    );
  }

  getBoard() {
    return this.board;
  }
}

export type EngineInstance = InstanceType<typeof Engine>;
