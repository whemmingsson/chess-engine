import { pieceMap } from "../../common/config/board-config";
import { HistoryMove } from "../../common/models/HistoryMove";
import { Move } from "../../common/models/Move";
import {
  nameOf,
  Piece,
  PieceClass,
  PieceColor,
} from "../../common/models/Piece";
import { config } from "./config/config";
import { validators } from "./PieceRules";
import {
  otherColor,
  toCell,
  toHistoryMove,
  toPosition,
} from "./utils/ConversionUtils";
import { generators } from "./ValidTargetCellsGenerators";

export class Engine {
  board: Record<string, Piece | null>;
  history: HistoryMove[];
  colorToMove: PieceColor;
  constructor() {
    console.log("Chess engine initialized");

    this.colorToMove = "White";
    this.board = {};
    this.history = [];

    this._initBoard();
  }

  _initBoard() {
    for (let i = 8; i >= 1; i--) {
      for (let j = 0; j < 8; j++) {
        const cellColLetter = String.fromCharCode(j + 65);
        const cellRowNumber = i;
        const cellKey = cellColLetter + cellRowNumber;
        const piece = pieceMap[cellKey];
        this.board[cellKey] = piece;
      }
    }
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

  _isPieceClassAt(pc: PieceClass, cell: string) {
    return this.board[cell]?.class === pc;
  }

  _isEnPassantMove(move: Move) {
    if (!this._isPieceClassAt("Pawn", move.source)) {
      return false;
    }

    const s = toPosition(move.source);
    const t = toPosition(move.target);
    const isDiagonalMove =
      Math.abs(s.column - t.column) === 1 && Math.abs(s.row - t.row) === 1;

    if (!isDiagonalMove) {
      return false;
    }

    const isTargetEmpty = !this.board[move.target];

    return isTargetEmpty;
  }

  _handleEnPassantMoveAndCapture(move: Move) {
    const pawnToMove = this.getPieceAtCell(move.source)!;

    const targetPosition = toPosition(move.target);
    const positionToClear = {
      column: targetPosition.column,
      row: targetPosition.row + (pawnToMove.color === "White" ? -1 : 1),
    };

    this.board[move.target] = pawnToMove;
    delete this.board[toCell(positionToClear)];
    delete this.board[move.source];
  }

  _handleDefaultMove(move: Move) {
    this.board[move.target] = this.getPieceAtCell(move.source);
    delete this.board[move.source];
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
    // Guard clauses
    if (!this._isMoveObjectValid(move)) {
      return;
    }

    if (!this.canPieceMove(move)) {
      return;
    }

    if (!this.canSpecificPieceMove(move)) {
      return;
    }

    // Specific piece handling
    if (this._isEnPassantMove(move)) {
      this._handleEnPassantMoveAndCapture(move);
      this.history.push(toHistoryMove(move, { enPassant: true }));
    } else {
      this._handleDefaultMove(move);
      this.history.push(move);
    }

    this.colorToMove = otherColor(this.colorToMove);
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
