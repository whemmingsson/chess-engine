import { EnrichedMove } from "../../common/models/EnrichedMove";
import { Piece, PieceColor } from "../../common/models/Piece";
import { Board } from "./Board";
import { config } from "./config/config";
import { classifyMove } from "./MoveClassiification";
import { canPieceMove, isMoveObjectValid } from "./MoveValidation";
import { extendWithPositions, InternalMove } from "./types/InternalMove";
import { PieceTargets } from "./types/PieceTargets";
import { otherColor, enrichMove, toPosition } from "./utils/ConversionUtils";
import { createNewPieceOfClass } from "./utils/PieceUtils";
import { generators } from "./ValidTargetCellsGenerators";

export class Engine {
  // Encapsulates the actual board
  private board: Board;

  // Keeps a record of all previous moves - used for generating valid en-passant moves
  history: EnrichedMove[];

  // The current color that is to perform a move
  colorToMove: PieceColor;

  // All pieces that have been moved
  movedPieces: Set<string>;

  // A special record keeping track of all targeted cells, for a given color
  targetedCellsByColor: Record<PieceColor, PieceTargets[]>;

  // Is the king under attack? This keeps track of that kings color
  isCheckColor?: PieceColor;

  // Contains the previosly calculated valid move targets
  validMovesCache?: string[];

  constructor(board?: Record<string, Piece | null>) {
    this.colorToMove = "White";
    this.history = [];
    this.movedPieces = new Set();
    this.targetedCellsByColor = {
      White: [],
      Black: [],
    };
    if (board) {
      this.board = new Board(board);
    } else {
      this.board = new Board();
    }
    this._updateTargetedCellsByColor();
    console.log("[ENGINE] Chess engine initialized");
  }

  /* -------------------------------------------------------------- */
  /* ------------------------- INTERNALS -------------------------- */
  /* -------------------------------------------------------------- */

  _resetEngine() {
    this.colorToMove = "White";
    this.board = new Board();
    this.history = [];
    this.movedPieces = new Set();
    this.targetedCellsByColor = {
      White: [],
      Black: [],
    };
    this._updateTargetedCellsByColor();
    this.isCheckColor = undefined;
    this.validMovesCache = undefined;
    console.log("[ENGINE] Chess engine re-initialized");
  }

  private _handleEnPassantMoveAndCapture(move: InternalMove) {
    this.board.executeEnPassant(move);
    this.history.push(enrichMove(move, { enPassant: true }));
  }

  private _handleDefaultMove(move: InternalMove) {
    this.board.executeDefault(move);
    this.history.push(move);
  }

  private _handlePromotionMove(move: InternalMove) {
    this.board.executePromotion(move, config.engine.autoPromoteToQueen);
    this.history.push(move);
  }

  private _handleCastelingMove(move: EnrichedMove): Piece {
    const rook = this.board.executeCasteling(move);

    this.history.push(
      enrichMove(move, { casteling: true, casteledRook: rook }),
    );

    this._registerPieceAsMoved(rook);

    return rook;
  }

  private _getValidTargetCellsForAll(color?: PieceColor): PieceTargets[] {
    return this.board.getPieces(color).flatMap((c) => {
      const piece = this.board.getPieceAt(c)!;

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
    if (this.movedPieces.has(piece.id)) {
      return;
    }

    this.movedPieces.add(piece.id);
  }

  private _isKingInCheck(pieceTargets?: PieceTargets[]) {
    const targetedCells =
      pieceTargets && pieceTargets.length > 0
        ? pieceTargets
        : this.targetedCellsByColor[this.colorToMove];

    const targetedKingPieces = targetedCells
      .flatMap((i) => i.targetCells)
      .map((c) => this.board.getPieceAt(c))
      .filter((c) => c && c.class === "King");
    return targetedKingPieces.length >= 1;
  }

  private _getAllValidTargets(source: string) {
    const piece = this.board.getPieceAt(source)!;

    const validTargetCells = generators[piece.class].generate(
      toPosition(source),
      this.board,
      this.history,
      this.movedPieces,
      this.targetedCellsByColor[otherColor(piece.color)],
    );

    const putsTheKingInCheck = (target: string) => {
      // Perform the move
      const capturedPiece = this.board.getPieceAt(target);
      this.board.setAt(piece, target);
      this.board.deleteAt(source);

      // Calculate the new targets
      const targeted = this._getValidTargetCellsForAll(otherColor(piece.color));
      const isKingChecked = this._isKingInCheck(targeted);

      // RESET! SUPER IMPORTANT!
      if (capturedPiece) {
        this.board.setAt(capturedPiece, target);
      } else {
        this.board.deleteAt(target);
      }

      this.board.setAt(piece, source);

      return isKingChecked;
    };

    return validTargetCells.filter((cell) => !putsTheKingInCheck(cell));
  }

  private _isMoveLegal(move: InternalMove) {
    const { target, source } = move;
    const piece = this.board.getPieceAt(source)!;
    const allValidTargets =
      this.validMovesCache && this.validMovesCache.length > 0
        ? this.validMovesCache
        : this._getAllValidTargets(source);

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
    console.log("[ENGINE] STATE");
    console.log(
      "[ENGINE] Board state: ",
      this.board
        .getPieces()
        .map((p) => `${p} : ${this.board.getPieceAt(p)!.id}`),
    );
    console.log(
      "[ENGINE] History:",
      this.history.map((move) => move.source + " -> " + move.target).join("\n"),
    );

    console.log("[ENGINE] Moved pieces:", this.movedPieces);
    console.log("[ENGINE] Target cells:", this.targetedCellsByColor);
    console.log("[ENGINE] /STATE");
  }

  movePiece(move: EnrichedMove) {
    const internalMove = extendWithPositions(move);

    if (!isMoveObjectValid(internalMove)) {
      this.validMovesCache = [];
      return;
    }

    if (
      !canPieceMove(
        internalMove,
        this.board.getPieceAt(internalMove.source),
        this.board.getPieceAt(internalMove.target),
        this.colorToMove,
        config.engine.disablePlayOrder,
      )
    ) {
      this.validMovesCache = [];
      return;
    }

    if (!this._isMoveLegal(internalMove)) {
      this.validMovesCache = [];
      return;
    }

    const pieceMoving = this.board.getPieceAt(internalMove.source)!;
    const pieceTargeted = this.board.getPieceAt(internalMove.target);

    const moveWithPieces = enrichMove(internalMove, {
      ...internalMove.metadata,
      pieceMoved: pieceMoving,
      pieceTargeted: pieceTargeted,
    }) as InternalMove;

    switch (classifyMove(moveWithPieces)) {
      case "EnPassant":
        this._handleEnPassantMoveAndCapture(internalMove);
        break;
      case "Promotion":
        this._handlePromotionMove(moveWithPieces);
        break;
      case "Casteling":
        this._handleCastelingMove(moveWithPieces);
        break;
      default:
        this._handleDefaultMove(moveWithPieces);
    }

    this._registerPieceAsMoved(pieceMoving);
    this._updateTargetedCellsByColor();

    if (this._isKingInCheck()) {
      this.isCheckColor = otherColor(this.colorToMove);
    }

    this.colorToMove = otherColor(this.colorToMove);
    this.validMovesCache = [];

    this.print();
  }

  getValidPositionsForPiece(source: string) {
    const piece = this.board.getPieceAt(source);

    if (!piece) {
      this.validMovesCache = [];
      return [];
    }

    const validTargets = this._getAllValidTargets(source);

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
    const targetPiece = this.board.getPieceAt(cell);

    if (targetPiece) {
      return this._getValidTargetCellsForAll(otherColor(targetPiece.color))
        .filter((i) => i.targetCells.indexOf(cell) >= 0)
        .map((i) => i.pieceCell);
    }

    // Inject a dummy pawn to act as "target"
    this.board.setAt(createNewPieceOfClass("Pawn", "Black", cell), cell);

    const whiteAttacks = this._getValidTargetCellsForAll("White")
      .filter((i) => i.targetCells.indexOf(cell) >= 0)
      .map((i) => i.pieceCell);

    // Inject a dummy pawn to act as "target"
    this.board.setAt(createNewPieceOfClass("Pawn", "White", cell), cell);

    const blackAttacks = this._getValidTargetCellsForAll("Black")
      .filter((i) => i.targetCells.indexOf(cell) >= 0)
      .map((i) => i.pieceCell);

    this.board.deleteAt(cell);

    return [...whiteAttacks, ...blackAttacks];
  }
}

export type EngineInstance = InstanceType<typeof Engine>;
