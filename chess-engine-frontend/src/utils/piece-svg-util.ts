import type { Piece } from "@chess-engine/common/models/Piece";
import * as pieces from "../assets/pieces-2";

type PieceKey =
  `${"White" | "Black"}${"King" | "Queen" | "Rook" | "Bishop" | "Knight" | "Pawn"}`;

const pieceSvgMap: Record<PieceKey, string> = {
  WhiteKing: pieces.kingW,
  WhiteQueen: pieces.queenW,
  WhiteRook: pieces.rookW,
  WhiteBishop: pieces.bishopW,
  WhiteKnight: pieces.knightW,
  WhitePawn: pieces.pawnW,
  BlackKing: pieces.kingB,
  BlackQueen: pieces.queenB,
  BlackRook: pieces.rookB,
  BlackBishop: pieces.bishopB,
  BlackKnight: pieces.knightB,
  BlackPawn: pieces.pawnB,
};

export const getPieceSvg = (piece: Piece) => {
  return pieceSvgMap[`${piece.color}${piece.class}`];
};
