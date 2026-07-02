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
import { MoveClass } from "./types/MoveClass";
import { PieceTargets } from "./types/PieceTargets";
import { Position } from "./types/Position";
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
  isCheckColor?: PieceColor; // Set to the color of the king currently under threat
  validMovesCache?: string[]; // Contains the previosly calculated valid move targets
  constructor(board?: Record<string, Piece | null>) {
    this.colorToMove = "White";

    this.history = [];
    this.movedPieces = new Set();
    this.targetedCellsByColor = {
      White: [],
      Black: [],
    };
    if (board) {
      this.board = board;
    } else {
      this.board = {};
      this._initBoard();
    }
    this._updateTargetedCellsByColor();
    console.log("[ENGINE] Chess engine initialized");
  }

  /* -------------------------------------------------------------- */
  /* ------------------------- INTERNALS -------------------------- */
  /* -------------------------------------------------------------- */

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
    this.isCheckColor = undefined;
    this.validMovesCache = undefined;
    console.log("[ENGINE] Chess engine re-initialized");
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

  private _getPieceAtCell(cellKey: string): Piece | null {
    return this.board[cellKey] || null;
  }

  private _deleteAtPos(pos: Position) {
    delete this.board[toCell(pos)];
  }

  private _deleteAt(cell: string) {
    delete this.board[cell];
  }

  private _setAtPos(piece: Piece, pos: Position) {
    this.board[toCell(pos)] = piece;
  }

  private _setAt(piece: Piece, cell: string) {
    this.board[cell] = piece;
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
    const pawnToMove = this._getPieceAtCell(move.source)!;

    const targetPosition = toPosition(move.target);
    const positionToClear = {
      column: targetPosition.column,
      row: targetPosition.row + (pawnToMove.color === "White" ? -1 : 1),
    };

    this._setAt(pawnToMove, move.target);
    this._deleteAtPos(positionToClear);
    this._deleteAt(move.source);

    this.history.push(enrichMove(move, { enPassant: true }));
  }

  private _handleDefaultMove(move: Move) {
    this._setAt(this._getPieceAtCell(move.source)!, move.target);
    this._deleteAt(move.source);
    this.history.push(move);
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
      this._deleteAt(move.source);
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

    this._deleteAt(move.source);

    this.history.push(move);
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

    const isKingSide = targetPos.column > sourcePos.column;

    const rookPosition = { row: sourcePos.row, column: isKingSide ? 8 : 1 };
    const rook = this.board[toCell(rookPosition)]!;

    const newRookPosition = {
      row: sourcePos.row,
      column: isKingSide ? targetPos.column - 1 : targetPos.column + 1,
    };

    this._setAt(this._getPieceAtCell(move.source)!, move.target);
    this._setAtPos(rook, newRookPosition);

    this._deleteAt(move.source);
    this._deleteAtPos(rookPosition);

    this.history.push(
      enrichMove(move, { casteling: true, casteledRook: rook }),
    );

    this._registerPieceAsMoved(rook);

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

  private _isKingInCheck(pieceTargets?: PieceTargets[]) {
    const targetedCells =
      pieceTargets && pieceTargets.length > 0
        ? pieceTargets
        : this.targetedCellsByColor[this.colorToMove];

    const targetedKingPieces = targetedCells
      .flatMap((i) => i.targetCells)
      .map((c) => (this.board[c] ? (this.board[c] as Piece) : null))
      .filter((c) => c && c.class === "King");
    return targetedKingPieces.length >= 1;
  }

  private _getAllValidTargets(move: EnrichedMove) {
    const { source } = move;
    const piece = this._getPieceAtCell(source)!;

    console.log(
      `[ENGINE] Calculating new valid targets for ${nameOf(piece)} at ${source}`,
    );

    const validTargetCells = generators[piece.class].generate(
      toPosition(source),
      this.board,
      this.history,
      this.movedPieces,
      this.targetedCellsByColor[otherColor(piece.color)],
    );

    if (!this.isCheckColor) {
      return validTargetCells;
    }

    const moveResolvesCheck = (target: string) => {
      console.log(
        `[ENGINE] Checking if moving ${nameOf(piece)} to target ${target} resolved the check..`,
      );
      // Perform the most hacky solution to date - move the piece and see if the king is still in check!
      // NOTE: There might be a situation where an en-passant or promotion would resolve the check. Lets come back to this. Right now the engine cannot resolve this with the current algorithm.

      // Perform the move
      const capturedPiece = this._getPieceAtCell(target);
      this.board[target] = piece;
      delete this.board[source];

      // Calculate the new targets
      const targeted = this._getValidTargetCellsForAll(otherColor(piece.color));
      const isKingStillChecked = this._isKingInCheck(targeted);

      // RESET! SUPER IMPORTANT!
      if (capturedPiece) {
        this.board[target] = capturedPiece;
      } else {
        delete this.board[target];
      }

      this.board[source] = piece;

      console.log(`[ENGINE] Is king still in check? ${isKingStillChecked}`);

      return !isKingStillChecked;
    };

    return validTargetCells.filter(moveResolvesCheck);
  }

  private _classifyMove(move: EnrichedMove): MoveClass {
    if (this._isEnPassantMove(move)) {
      return "EnPassant";
    }

    if (this._isPromotionMove(move)) {
      return "Promotion";
    }

    if (this._isCastelingMove(move)) {
      return "Casteling";
    }

    return "Default";
  }

  private _canPieceMove(move: Move) {
    /* This method does the trivial checks that are piece agnostic*/

    const piece = this._getPieceAtCell(move.source);

    // No piece violation test
    if (!piece) {
      throw Error(`Not a piece at: ${move.source}`);
    }

    // Color violation test
    if (!config.engine.disablePlayOrder && piece.color !== this.colorToMove) {
      throw Error(`It is ${this.colorToMove}'s turn to move`);
    }

    const pieceAtTargetCell = this._getPieceAtCell(move.target);

    // Target piece of same color violation test
    if (pieceAtTargetCell && pieceAtTargetCell.color === piece.color) {
      throw Error(
        `Piece at target cell ${move.target} - ${nameOf(pieceAtTargetCell)} has the same color as piece to be moved - ${nameOf(piece)}`,
      );
    }

    return true;
  }

  private _canSpecificPieceMove(move: Move) {
    const { target } = move;
    const piece = this._getPieceAtCell(move.source)!;
    const allValidTargets =
      this.validMovesCache && this.validMovesCache.length > 0
        ? this.validMovesCache
        : this._getAllValidTargets(move);

    const isValidMove = allValidTargets.some((p) => p === target);

    if (!isValidMove) {
      throw Error(`Invalid move for ${piece.class}`);
    }

    return true;
  }

  /* --------------------------------------------------------------*/
  /* ------------------------- PUBLIC API ------------------------ */
  /* --------------------------------------------------------------*/

  print() {
    console.log("Current board state: ", this.board);
    console.log(
      "Current history:",
      this.history.map((move) => move.source + " -> " + move.target).join("\n"),
    );
  }

  movePiece(move: EnrichedMove) {
    if (!this._isMoveObjectValid(move)) {
      this.validMovesCache = [];
      return;
    }

    if (!this._canPieceMove(move)) {
      this.validMovesCache = [];
      return;
    }

    if (!this._canSpecificPieceMove(move)) {
      this.validMovesCache = [];
      return;
    }

    const pieceMoving = this.board[move.source]!;

    switch (this._classifyMove(move)) {
      case "EnPassant":
        this._handleEnPassantMoveAndCapture(move);
        break;
      case "Promotion":
        this._handlePromotionMove(move);
        break;
      case "Casteling":
        this._handleCastelingMove(move);
        break;
      default:
        this._handleDefaultMove(move);
    }

    this._registerPieceAsMoved(pieceMoving);
    this._updateTargetedCellsByColor();

    const isKingChecked = this._isKingInCheck();
    if (isKingChecked) {
      this.isCheckColor = otherColor(this.colorToMove);
      console.log(`${this.isCheckColor}'s king is under attack!`);
    }

    this.colorToMove = otherColor(this.colorToMove);
    this.validMovesCache = [];
  }

  getValidPositionsForPiece(source: string) {
    const piece = this._getPieceAtCell(source);

    if (!piece) {
      this.validMovesCache = [];
      return [];
    }

    const validTargets = this._getAllValidTargets({ source, target: "" }); // TODO: How to fix this ugly crap?

    this.validMovesCache = validTargets;

    return validTargets;
  }

  getBoard() {
    return this.board;
  }

  resetGame() {
    this._resetEngine();
  }

  getCellsThatTargetsCell(cell: string) {
    const targetPiece = this._getPieceAtCell(cell);

    if (targetPiece) {
      return this._getValidTargetCellsForAll(otherColor(targetPiece.color))
        .filter((i) => i.targetCells.indexOf(cell) >= 0)
        .map((i) => i.pieceCell);
    }

    // Inject a dummy pawn to act as "target"
    this._setAt(createNewPieceOfClass("Pawn", "Black", cell), cell);

    const whiteAttacks = this._getValidTargetCellsForAll("White")
      .filter((i) => i.targetCells.indexOf(cell) >= 0)
      .map((i) => i.pieceCell);

    // Inject a dummy pawn to act as "target"
    this._setAt(createNewPieceOfClass("Pawn", "White", cell), cell);

    const blackAttacks = this._getValidTargetCellsForAll("Black")
      .filter((i) => i.targetCells.indexOf(cell) >= 0)
      .map((i) => i.pieceCell);

    this._deleteAt(cell);

    return [...whiteAttacks, ...blackAttacks];
  }
}

export type EngineInstance = InstanceType<typeof Engine>;
