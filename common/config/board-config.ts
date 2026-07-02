import type {
  Piece,
  PieceClass,
  PieceColor,
  PieceShortClass,
} from "../models/Piece";

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

export const makeId = (
  sourceCell: string,
  color: PieceColor,
  shortClass: PieceShortClass,
) => {
  return `${color[0]}${shortClass}@${sourceCell}`;
};

// Setup of pieces
export const pieceMap: Record<string, Piece> = {
  A1: {
    ...Rook,
    color: "White",
    id: makeId("A1", "White", Rook.shortClass),
  },
  B1: {
    ...Knight,
    color: "White",
    id: makeId("B1", "White", Knight.shortClass),
  },
  C1: {
    ...Bishop,
    color: "White",
    id: makeId("C1", "White", Bishop.shortClass),
  },
  D1: {
    ...Queen,
    color: "White",
    id: makeId("D1", "White", Queen.shortClass),
  },
  E1: {
    ...King,
    color: "White",
    id: makeId("E1", "White", King.shortClass),
  },
  F1: {
    ...Bishop,
    color: "White",
    id: makeId("F1", "White", Bishop.shortClass),
  },
  G1: {
    ...Knight,
    color: "White",
    id: makeId("G1", "White", Knight.shortClass),
  },
  H1: {
    ...Rook,
    color: "White",
    id: makeId("H1", "White", Rook.shortClass),
  },
  A2: {
    ...Pawn,
    color: "White",
    id: makeId("A2", "White", Pawn.shortClass),
  },
  B2: {
    ...Pawn,
    color: "White",
    id: makeId("B2", "White", Pawn.shortClass),
  },
  C2: {
    ...Pawn,
    color: "White",
    id: makeId("C2", "White", Pawn.shortClass),
  },
  D2: {
    ...Pawn,
    color: "White",
    id: makeId("D2", "White", Pawn.shortClass),
  },
  E2: {
    ...Pawn,
    color: "White",
    id: makeId("E2", "White", Pawn.shortClass),
  },
  F2: {
    ...Pawn,
    color: "White",
    id: makeId("F2", "White", Pawn.shortClass),
  },
  G2: {
    ...Pawn,
    color: "White",
    id: makeId("G2", "White", Pawn.shortClass),
  },
  H2: {
    ...Pawn,
    color: "White",
    id: makeId("H2", "White", Pawn.shortClass),
  },
  A7: {
    ...Pawn,
    color: "Black",
    id: makeId("A7", "Black", Pawn.shortClass),
  },
  B7: {
    ...Pawn,
    color: "Black",
    id: makeId("B7", "Black", Pawn.shortClass),
  },
  C7: {
    ...Pawn,
    color: "Black",
    id: makeId("C7", "Black", Pawn.shortClass),
  },
  D7: {
    ...Pawn,
    color: "Black",
    id: makeId("D7", "Black", Pawn.shortClass),
  },
  E7: {
    ...Pawn,
    color: "Black",
    id: makeId("E7", "Black", Pawn.shortClass),
  },
  F7: {
    ...Pawn,
    color: "Black",
    id: makeId("F7", "Black", Pawn.shortClass),
  },
  G7: {
    ...Pawn,
    color: "Black",
    id: makeId("G7", "Black", Pawn.shortClass),
  },
  H7: {
    ...Pawn,
    color: "Black",
    id: makeId("H7", "Black", Pawn.shortClass),
  },
  A8: {
    ...Rook,
    color: "Black",
    id: makeId("A8", "Black", Rook.shortClass),
  },
  B8: {
    ...Knight,
    color: "Black",
    id: makeId("B8", "Black", Knight.shortClass),
  },
  C8: {
    ...Bishop,
    color: "Black",
    id: makeId("C8", "Black", Bishop.shortClass),
  },
  D8: {
    ...Queen,
    color: "Black",
    id: makeId("D8", "Black", Queen.shortClass),
  },
  E8: {
    ...King,
    color: "Black",
    id: makeId("E8", "Black", King.shortClass),
  },
  F8: {
    ...Bishop,
    color: "Black",
    id: makeId("F8", "Black", Bishop.shortClass),
  },
  G8: {
    ...Knight,
    color: "Black",
    id: makeId("G8", "Black", Knight.shortClass),
  },
  H8: {
    ...Rook,
    color: "Black",
    id: makeId("H8", "Black", Rook.shortClass),
  },
};
