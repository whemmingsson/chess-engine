export type PieceClass =
  | "King"
  | "Queen"
  | "Rook"
  | "Bishop"
  | "Knight"
  | "Pawn";

export type PieceShortClass = "K" | "Q" | "R" | "B" | "N" | "P";

export type PieceColor = "White" | "Black";

export interface Piece {
  class: PieceClass;
  color: PieceColor;
  shortClass: PieceShortClass;
  id: string;
}

export const nameOf = (p: Piece) => {
  return `${p.color[0]}${p.shortClass}`;
};

export const toString = (p: Piece) => {
  return nameOf(p);
};
