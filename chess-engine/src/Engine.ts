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
import { PieceTargets } from "./types/PieceTargets";
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
  targetedCellsByColor: Record<PieceColor, PieceTargets[]>;
  constructor() {
    this.colorToMove = "White";
    this.board = {};
    this.history = [];
    this.movedPieces = new Set();
    this.targetedCellsByColor = {
      White: [],
      Black: [],
    };
    this._initBoard();
    this._updateTargetedCellsByColor();
    console.log("Chess engine initialized");
  }

  _resetEngine() {
    this.colorToMove = "White";
    this.board = {};
    this.history = [];
    this.movedPieces = new Set();
    this.targetedCellsByColor = {
      White: [],
      Black: [],
    };
    this._initBoard();
    this._updateTargetedCellsByColor();
    console.log("Chess engine initialized");
  }

  private _initBoard() {
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

  private _isMoveObjectValid(move: Move) {
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

  private _isPieceClassAt(pc: PieceClass, cell: string) {
    return this.board[cell]?.class === pc;
  }

  private _isEnPassantMove(move: Move) {
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

  private _handleEnPassantMoveAndCapture(move: Move) {
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

  private _handleDefaultMove(move: Move) {
    this.board[move.target] = this.getPieceAtCell(move.source);
    delete this.board[move.source];
  }

  private _isPromotionMove(move: Move) {
    if (!this._isPieceClassAt("Pawn", move.source)) {
      return false;
    }

    const targetPosition = toPosition(move.target);

    return targetPosition.row === 1 || targetPosition.row === 8;
  }

  private _handlePromotionMove(move: EnrichedMove) {
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

  private _promoteToPieceAt(
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

  private _isCastelingMove(move: EnrichedMove) {
    const movingPiece = this.board[move.source];
    if (!movingPiece) {
      return false;
    }

    if (movingPiece.class !== "King") {
      return false;
    }

    const sourcePos = toPosition(move.source);
    const targetPos = toPosition(move.target);

    if (sourcePos.row !== targetPos.row) {
      return false;
    }

    const moveLength = Math.abs(sourcePos.column - targetPos.column);

    return moveLength === 2;
  }

  private _handleCastelingMove(move: EnrichedMove): Piece {
    const sourcePos = toPosition(move.source);
    const targetPos = toPosition(move.target);

    const isKingSide = targetPos.column > sourcePos.column; // Oterwise queenside, obviously

    const rookPosition = { row: sourcePos.row, column: isKingSide ? 8 : 1 };
    const rook = this.board[toCell(rookPosition)]!;

    const newRookPosition = {
      row: sourcePos.row,
      column: isKingSide ? targetPos.column - 1 : targetPos.column + 1,
    };

    this.board[toCell(targetPos)] = this.getPieceAtCell(move.source);
    this.board[toCell(newRookPosition)] = rook;

    delete this.board[toCell(rookPosition)];
    delete this.board[move.source];

    return rook;
  }

  private _getValidTargetCellsForAll(color?: PieceColor): PieceTargets[] {
    return Object.keys(this.board)
      .filter((c) => this.board[c] !== null && this.board[c] !== undefined)
      .filter((c) => this.board[c]?.color === color)
      .flatMap((c) => {
        const piece = this.board[c]!;

        return {
          piece,
          pieceCell: c,
          targetCells: generators[piece.class].generate(
            toPosition(c),
            this.board,
            this.history,
            this.movedPieces,
          ),
        };
      });
  }

  private _updateTargetedCellsByColor() {
    this.targetedCellsByColor.White = this._getValidTargetCellsForAll("White");
    this.targetedCellsByColor.Black = this._getValidTargetCellsForAll("Black");
  }

  private _registerPieceAsMoved(piece: Piece) {
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

    const targetedCells =
      piece.class === "King"
        ? this.targetedCellsByColor[otherColor(piece.color)]
        : [];

    return validators[piece.class](
      move,
      this.board,
      this.history,
      this.movedPieces,
      targetedCells,
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
    } else if (this._isCastelingMove(move)) {
      const casteledRook = this._handleCastelingMove(move);
      this.history.push(enrichMove(move, { casteling: true, casteledRook }));
      this._registerPieceAsMoved(casteledRook);
    } else {
      this._handleDefaultMove(move);
      this.history.push(move);
    }

    this._registerPieceAsMoved(pieceMoving);

    this._updateTargetedCellsByColor();

    this.colorToMove = otherColor(this.colorToMove);
  }

  getValidPositionsForPiece(source: string) {
    const piece = this.getPieceAtCell(source);

    // No piece violation test
    if (!piece) {
      return [];
    }

    const targetedCells =
      piece.class === "King"
        ? this.targetedCellsByColor[otherColor(piece.color)]
        : [];

    return generators[piece.class].generate(
      toPosition(source),
      this.board,
      this.history,
      this.movedPieces,
      targetedCells,
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
