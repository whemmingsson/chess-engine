"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pieceMap = exports.makeId = exports.pieceDefinitionMap = exports.Pawn = exports.King = exports.Queen = exports.Bishop = exports.Knight = exports.Rook = void 0;
exports.Rook = {
    class: "Rook",
    shortClass: "R",
};
exports.Knight = {
    class: "Knight",
    shortClass: "N",
};
exports.Bishop = {
    class: "Bishop",
    shortClass: "B",
};
exports.Queen = {
    class: "Queen",
    shortClass: "Q",
};
exports.King = {
    class: "King",
    shortClass: "K",
};
exports.Pawn = {
    class: "Pawn",
    shortClass: "P",
};
exports.pieceDefinitionMap = {
    Rook: exports.Rook,
    Knight: exports.Knight,
    Bishop: exports.Bishop,
    Queen: exports.Queen,
    King: exports.King,
    Pawn: exports.Pawn,
};
const makeId = (sourceCell, color, shortClass) => {
    return `${color[0]}${shortClass}@${sourceCell}`;
};
exports.makeId = makeId;
// Setup of pieces
exports.pieceMap = {
    A1: {
        ...exports.Rook,
        color: "White",
        id: (0, exports.makeId)("A1", "White", exports.Rook.shortClass),
    },
    B1: {
        ...exports.Knight,
        color: "White",
        id: (0, exports.makeId)("B1", "White", exports.Knight.shortClass),
    },
    C1: {
        ...exports.Bishop,
        color: "White",
        id: (0, exports.makeId)("C1", "White", exports.Bishop.shortClass),
    },
    D1: {
        ...exports.Queen,
        color: "White",
        id: (0, exports.makeId)("D1", "White", exports.Queen.shortClass),
    },
    E1: {
        ...exports.King,
        color: "White",
        id: (0, exports.makeId)("E1", "White", exports.King.shortClass),
    },
    F1: {
        ...exports.Bishop,
        color: "White",
        id: (0, exports.makeId)("F1", "White", exports.Bishop.shortClass),
    },
    G1: {
        ...exports.Knight,
        color: "White",
        id: (0, exports.makeId)("G1", "White", exports.Knight.shortClass),
    },
    H1: {
        ...exports.Rook,
        color: "White",
        id: (0, exports.makeId)("H1", "White", exports.Rook.shortClass),
    },
    A2: {
        ...exports.Pawn,
        color: "White",
        id: (0, exports.makeId)("A2", "White", exports.Pawn.shortClass),
    },
    B2: {
        ...exports.Pawn,
        color: "White",
        id: (0, exports.makeId)("B2", "White", exports.Pawn.shortClass),
    },
    C2: {
        ...exports.Pawn,
        color: "White",
        id: (0, exports.makeId)("C2", "White", exports.Pawn.shortClass),
    },
    D2: {
        ...exports.Pawn,
        color: "White",
        id: (0, exports.makeId)("D2", "White", exports.Pawn.shortClass),
    },
    E2: {
        ...exports.Pawn,
        color: "White",
        id: (0, exports.makeId)("E2", "White", exports.Pawn.shortClass),
    },
    F2: {
        ...exports.Pawn,
        color: "White",
        id: (0, exports.makeId)("F2", "White", exports.Pawn.shortClass),
    },
    G2: {
        ...exports.Pawn,
        color: "White",
        id: (0, exports.makeId)("G2", "White", exports.Pawn.shortClass),
    },
    H2: {
        ...exports.Pawn,
        color: "White",
        id: (0, exports.makeId)("H2", "White", exports.Pawn.shortClass),
    },
    A7: {
        ...exports.Pawn,
        color: "Black",
        id: (0, exports.makeId)("A7", "Black", exports.Pawn.shortClass),
    },
    B7: {
        ...exports.Pawn,
        color: "Black",
        id: (0, exports.makeId)("B7", "Black", exports.Pawn.shortClass),
    },
    C7: {
        ...exports.Pawn,
        color: "Black",
        id: (0, exports.makeId)("C7", "Black", exports.Pawn.shortClass),
    },
    D7: {
        ...exports.Pawn,
        color: "Black",
        id: (0, exports.makeId)("D7", "Black", exports.Pawn.shortClass),
    },
    E7: {
        ...exports.Pawn,
        color: "Black",
        id: (0, exports.makeId)("E7", "Black", exports.Pawn.shortClass),
    },
    F7: {
        ...exports.Pawn,
        color: "Black",
        id: (0, exports.makeId)("F7", "Black", exports.Pawn.shortClass),
    },
    G7: {
        ...exports.Pawn,
        color: "Black",
        id: (0, exports.makeId)("G7", "Black", exports.Pawn.shortClass),
    },
    H7: {
        ...exports.Pawn,
        color: "Black",
        id: (0, exports.makeId)("H7", "Black", exports.Pawn.shortClass),
    },
    A8: {
        ...exports.Rook,
        color: "Black",
        id: (0, exports.makeId)("A8", "Black", exports.Rook.shortClass),
    },
    B8: {
        ...exports.Knight,
        color: "Black",
        id: (0, exports.makeId)("B8", "Black", exports.Knight.shortClass),
    },
    C8: {
        ...exports.Bishop,
        color: "Black",
        id: (0, exports.makeId)("C8", "Black", exports.Bishop.shortClass),
    },
    D8: {
        ...exports.Queen,
        color: "Black",
        id: (0, exports.makeId)("D8", "Black", exports.Queen.shortClass),
    },
    E8: {
        ...exports.King,
        color: "Black",
        id: (0, exports.makeId)("E8", "Black", exports.King.shortClass),
    },
    F8: {
        ...exports.Bishop,
        color: "Black",
        id: (0, exports.makeId)("F8", "Black", exports.Bishop.shortClass),
    },
    G8: {
        ...exports.Knight,
        color: "Black",
        id: (0, exports.makeId)("G8", "Black", exports.Knight.shortClass),
    },
    H8: {
        ...exports.Rook,
        color: "Black",
        id: (0, exports.makeId)("H8", "Black", exports.Rook.shortClass),
    },
};
