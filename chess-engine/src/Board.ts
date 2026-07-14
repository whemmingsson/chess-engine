import { pieceMap } from "@chess-engine/common/config/board-config";
import { EnrichedMove } from "@chess-engine/common/models/EnrichedMove";
import { Move } from "@chess-engine/common/models/Move";
import {
  Piece,
  PieceClass,
  PieceColor,
} from "@chess-engine/common/models/Piece";
import { BoardMap } from "./types/BoardMap";
import { Position } from "./types/Position";
import { toCell, toPosition } from "./utils/ConversionUtils";
import { createNewPieceOfClass } from "./utils/PieceUtils";

export class Board {
  private boardMap: BoardMap;

  constructor(board?: BoardMap) {
    this.boardMap = {};
    this.initialize(board);
  }

  private initialize(board?: BoardMap) {
    if (board) {
      this.boardMap = board;
      return;
    }

    for (let i = 8; i >= 1; i--) {
      for (let j = 0; j < 8; j++) {
        const cellColLetter = String.fromCharCode(j + 65);
        const cellRowNumber = i;
        const cellKey = cellColLetter + cellRowNumber;
        const piece = pieceMap[cellKey];
        this.boardMap[cellKey] = piece;
      }
    }
  }

  private getCellKey(cell: string | Position) {
    return typeof cell === "string" ? cell : toCell(cell);
  }

  getBoard() {
    return this.boardMap;
  }

  isPieceClassAt(pc: PieceClass, cell: string) {
    return this.boardMap[cell]?.class === pc;
  }

  deleteAt(cell: string | Position) {
    delete this.boardMap[this.getCellKey(cell)];
  }

  setAt(piece: Piece, cell: string | Position) {
    this.boardMap[this.getCellKey(cell)] = piece;
  }

  isEmptyAt(cell: string | Position) {
    const cellKey = this.getCellKey(cell);
    return !this.boardMap[cellKey];
  }

  hasPieceAt(cell: string | Position) {
    return !this.isEmptyAt(cell);
  }

  getPieceAt(cell: string | Position) {
    return this.boardMap[this.getCellKey(cell)];
  }

  getPieces(color?: PieceColor) {
    return Object.keys(this.boardMap)
      .filter(
        (c) => this.boardMap[c] !== null && this.boardMap[c] !== undefined,
      )
      .filter((c) => (!!color ? this.boardMap[c]!.color === color : true));
  }

  query() {
    // TODO: Implement query method to reduce if statements of doom
  }

  promoteToPieceAt(
    pieceClass: PieceClass,
    pieceColor: PieceColor,
    targetCell: string,
  ) {
    this.setAt(
      createNewPieceOfClass(pieceClass, pieceColor, targetCell),
      targetCell,
    );
  }

  executeDefault(move: Move) {
    this.setAt(this.getPieceAt(move.source)!, move.target);
    this.deleteAt(move.source);
  }

  executeEnPassant(move: Move) {
    const pawnToMove = this.getPieceAt(move.source)!;

    const targetPosition = toPosition(move.target);
    const positionToClear = {
      column: targetPosition.column,
      row: targetPosition.row + (pawnToMove.color === "White" ? -1 : 1),
    };

    this.setAt(pawnToMove, move.target);
    this.deleteAt(positionToClear);
    this.deleteAt(move.source);
  }

  executePromotion(move: EnrichedMove, autoPromoteToQueen: boolean) {
    const pawnToPromote = this.getPieceAt(move.source)!;

    if (autoPromoteToQueen) {
      this.promoteToPieceAt("Queen", pawnToPromote.color, move.target);
      this.deleteAt(move.source);
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

    this.promoteToPieceAt(
      move.metadata.promoteTo,
      pawnToPromote.color,
      move.target,
    );

    this.deleteAt(move.source);
  }

  executeCasteling(move: Move) {
    const sourcePos = toPosition(move.source);
    const targetPos = toPosition(move.target);

    const isKingSide = targetPos.column > sourcePos.column;

    const rookPosition = { row: sourcePos.row, column: isKingSide ? 8 : 1 };
    const rook = this.getPieceAt(rookPosition)!;

    const newRookPosition = {
      row: sourcePos.row,
      column: isKingSide ? targetPos.column - 1 : targetPos.column + 1,
    };

    this.setAt(this.getPieceAt(move.source)!, move.target);
    this.setAt(rook, newRookPosition);

    this.deleteAt(move.source);
    this.deleteAt(rookPosition);

    return rook;
  }
}
