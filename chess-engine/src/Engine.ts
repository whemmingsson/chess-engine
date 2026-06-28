import { pieceMap } from "../../common/config/board-config";
import { EnrichedMove } from "../../common/models/EnrichedMove";
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
  enrichMove,
  toPosition,
} from "./utils/ConversionUtils";
import { createNewPieceOfClass } from "./utils/PieceUtils";
import { generators } from "./ValidTargetCellsGenerators";

export class Engine {
  board: Record<string, Piece | null>;
  history: EnrichedMove[];
  colorToMove: PieceColor;
  movedPieces: Set<string>;
  constructor() {
    this.colorToMove = "White";
    this.board = {};
    this.history = [];
    this.movedPieces = new Set();
    this._initBoard();
    console.log("Chess engine initialized");
  }

  _resetEngine() {
    this.colorToMove = "White";
    this.board = {};
    this.history = [];
    this.movedPieces = new Set();
    this._initBoard();
    console.log("Chess engine initialized");
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

  _isPromotionMove(move: Move) {
    if (!this._isPieceClassAt("Pawn", move.source)) {
      return false;
    }

    const targetPosition = toPosition(move.target);

    return targetPosition.row === 1 || targetPosition.row === 8;
  }

  _handlePromotionMove(move: EnrichedMove) {
    const pawnToPromote = this.board[move.source]!;

    if (config.engine.autoPromoteToQueen) {
      this._promoteToPieceAt("Queen", pawnToPromote.color, move.target);
      delete this.board[move.source];
      return;
    }

    if (!move.metadata?.promoteTo) {
      throw Error(
        "Missing promotion metadata. Set move.metadata.promoteTo to desired class.",
      );
    }

    if (move.metadata?.promoteTo === "King") {
      throw Error("Invalid promotion metadata. Cannot promote to King.");
    }

    this._promoteToPieceAt(
      move.metadata.promoteTo,
      pawnToPromote.color,
      move.target,
    );

    delete this.board[move.source];
  }

  _promoteToPieceAt(
    pieceClass: PieceClass,
    pieceColor: PieceColor,
    targetCell: string,
  ) {
    this.board[targetCell] = createNewPieceOfClass(
      pieceClass,
      pieceColor,
      targetCell,
    );
  }

  _getValidTargetCellsForAll(color?: PieceColor) {
    return Object.keys(this.board)
      .filter((c) => this.board[c] !== null && this.board[c] !== undefined)
      .filter((c) => this.board[c]?.color === color)
      .flatMap((c) => {
        return {
          piece: this.board[c],
          pieceCell: c,
          targetCells: this.getValidPositionsForPiece(c),
        };
      });
  }

  _registerPieceAsMoved(piece: Piece) {
    const pieceId = piece.id;
    if (this.movedPieces.has(pieceId)) {
      return;
    }

    this.movedPieces.add(pieceId);
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
    return validators[piece.class](
      move,
      this.board,
      this.history,
      this.movedPieces,
    );
  }

  movePiece(move: EnrichedMove) {
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

    const pieceMoving = this.board[move.source]!;

    if (this._isEnPassantMove(move)) {
      this._handleEnPassantMoveAndCapture(move);
      this.history.push(enrichMove(move, { enPassant: true }));
    } else if (this._isPromotionMove(move)) {
      this._handlePromotionMove(move);
      this.history.push(move);
    } else {
      this._handleDefaultMove(move);
      this.history.push(move);
    }

    this._registerPieceAsMoved(pieceMoving);

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
      this.movedPieces,
    );
  }

  getBoard() {
    return this.board;
  }

  resetGame() {
    this._resetEngine();
  }

  getCellsThatTargetsCell(cell: string) {
    const targetPiece = this.board[cell];

    if (targetPiece) {
      return this._getValidTargetCellsForAll(otherColor(targetPiece.color))
        .filter((i) => i.targetCells.indexOf(cell) >= 0)
        .map((i) => i.pieceCell);
    }

    // Inject a dummy pawn to act as "target"
    this.board[cell] = createNewPieceOfClass("Pawn", "Black", cell);

    const whiteAttacks = this._getValidTargetCellsForAll("White")
      .filter((i) => i.targetCells.indexOf(cell) >= 0)
      .map((i) => i.pieceCell);

    // Inject a dummy pawn to act as "target"
    this.board[cell] = createNewPieceOfClass("Pawn", "White", cell);

    const blackAttacks = this._getValidTargetCellsForAll("Black")
      .filter((i) => i.targetCells.indexOf(cell) >= 0)
      .map((i) => i.pieceCell);

    delete this.board[cell];

    return [...whiteAttacks, ...blackAttacks];
  }
}

export type EngineInstance = InstanceType<typeof Engine>;
