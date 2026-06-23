import type { Piece, PieceClass, PieceShortClass } from "../models/Piece";

interface PieceDefinition {
  class: PieceClass;
  shortClass: PieceShortClass;
}

export const Rook: PieceDefinition = {
  class: "Rook",
  shortClass: "R",
};

export const Knight: PieceDefinition = {
  class: "Knight",
  shortClass: "N",
};

export const Bishop: PieceDefinition = {
  class: "Bishop",
  shortClass: "B",
};

export const Queen: PieceDefinition = {
  class: "Queen",
  shortClass: "Q",
};

export const King: PieceDefinition = {
  class: "King",
  shortClass: "K",
};

export const Pawn: PieceDefinition = {
  class: "Pawn",
  shortClass: "P",
};

export const pieceDefinitionMap: Record<PieceClass, PieceDefinition> = {
  Rook,
  Knight,
  Bishop,
  Queen,
  King,
  Pawn,
};

// Setup of pieces
export const pieceMap: Record<string, Piece> = {
  A1: {
    ...Rook,
    color: "White",
  },
  B1: {
    ...Knight,
    color: "White",
  },
  C1: {
    ...Bishop,
    color: "White",
  },
  D1: {
    ...Queen,
    color: "White",
  },
  E1: {
    ...King,
    color: "White",
  },
  F1: {
    ...Bishop,
    color: "White",
  },
  G1: {
    ...Knight,
    color: "White",
  },
  H1: {
    ...Rook,
    color: "White",
  },
  A2: {
    ...Pawn,
    color: "White",
  },
  B2: {
    ...Pawn,
    color: "White",
  },
  C2: {
    ...Pawn,
    color: "White",
  },
  D2: {
    ...Pawn,
    color: "White",
  },
  E2: {
    ...Pawn,
    color: "White",
  },
  F2: {
    ...Pawn,
    color: "White",
  },
  G2: {
    ...Pawn,
    color: "White",
  },
  H2: {
    ...Pawn,
    color: "White",
  },
  A7: {
    ...Pawn,
    color: "Black",
  },
  B7: {
    ...Pawn,
    color: "Black",
  },
  C7: {
    ...Pawn,
    color: "Black",
  },
  D7: {
    ...Pawn,
    color: "Black",
  },
  E7: {
    ...Pawn,
    color: "Black",
  },
  F7: {
    ...Pawn,
    color: "Black",
  },
  G7: {
    ...Pawn,
    color: "Black",
  },
  H7: {
    ...Pawn,
    color: "Black",
  },
  A8: {
    ...Rook,
    color: "Black",
  },
  B8: {
    ...Knight,
    color: "Black",
  },
  C8: {
    ...Bishop,
    color: "Black",
  },
  D8: {
    ...Queen,
    color: "Black",
  },
  E8: {
    ...King,
    color: "Black",
  },
  F8: {
    ...Bishop,
    color: "Black",
  },
  G8: {
    ...Knight,
    color: "Black",
  },
  H8: {
    ...Rook,
    color: "Black",
  },
};
