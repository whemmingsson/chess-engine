import { Board } from "./types/Board";
import { Position } from "./types/Position";
import { otherColor, toCell } from "./utils/ConversionUtils";
import { PieceClass } from "../../common/models/Piece";

type TargetCellGenerator = {
  generate: (source: Position, board: Board) => string[];
};

// Utilities
const generateTargetCells = (
  board: Board,
  source: Position,
  rInc: number,
  cInc: number,
  rWhileFunc: (r: number) => boolean,
  cWhileFunc: (c: number) => boolean,
): Position[] => {
  const sourceCell = toCell(source);
  const oppositeColor = otherColor(board[sourceCell]!.color);
  const positions = [];
  let r = source.row + rInc;
  let c = source.column + cInc;
  while (rWhileFunc(r) && cWhileFunc(c)) {
    const position = { row: r, column: c };
    const cell = toCell(position);

    if (!board[cell] || board[cell].color === oppositeColor) {
      positions.push(position);
    }

    if (board[cell]) {
      break;
    }

    r += rInc;
    c += cInc;
  }

  return positions;
};

const generateValidDiagonalPositions = (b: Board, s: Position) => {
  const possiblePositions: Position[] = [];

  // Moving up-right
  possiblePositions.push(
    ...generateTargetCells(
      b,
      s,
      1,
      1,
      (r) => r <= 8,
      (c) => c <= 8,
    ),
  );

  // Moving down-left
  possiblePositions.push(
    ...generateTargetCells(
      b,
      s,
      -1,
      -1,
      (r) => r >= 1,
      (c) => c >= 1,
    ),
  );

  // Moving up-left
  possiblePositions.push(
    ...generateTargetCells(
      b,
      s,
      1,
      -1,
      (r) => r <= 8,
      (c) => c >= 1,
    ),
  );

  // Moving down-right
  possiblePositions.push(
    ...generateTargetCells(
      b,
      s,
      -1,
      1,
      (r) => r >= 1,
      (c) => c <= 8,
    ),
  );

  return possiblePositions;
};

const generateValidCardinalPositions = (b: Board, s: Position) => {
  const possiblePositions: Position[] = [];

  // Moving right
  possiblePositions.push(
    ...generateTargetCells(
      b,
      s,
      0,
      1,
      () => true,
      (c) => c <= 8,
    ),
  );

  // Moving left
  possiblePositions.push(
    ...generateTargetCells(
      b,
      s,
      0,
      -1,
      () => true,
      (c) => c >= 1,
    ),
  );

  // Moving up
  possiblePositions.push(
    ...generateTargetCells(
      b,
      s,
      1,
      0,
      (r) => r <= 8,
      () => true,
    ),
  );

  // Moving down
  possiblePositions.push(
    ...generateTargetCells(
      b,
      s,
      -1,
      0,
      (r) => r >= 1,
      () => true,
    ),
  );

  return possiblePositions;
};

const generateValidPawnPositions = (board: Board, source: Position) => {
  const possiblePositions: Position[] = [];
  const sourceCell = toCell(source);
  const piece = board[sourceCell]!;
  const isWhite = piece.color === "White";
  const firstMove = isWhite ? source.row === 2 : source.row === 7;
  const direction = isWhite ? 1 : -1;
  const forwardOne = { column: source.column, row: source.row + direction };
  const forwardTwo = { column: source.column, row: source.row + direction * 2 };
  const diagonalLeft = {
    column: source.column - 1,
    row: source.row + direction,
  };
  const diagonalRight = {
    column: source.column + 1,
    row: source.row + direction,
  };

  if (!board[toCell(forwardOne)]) {
    possiblePositions.push(forwardOne);
  }

  if (firstMove && !board[toCell(forwardOne)] && !board[toCell(forwardTwo)]) {
    possiblePositions.push(forwardTwo);
  }

  const leftTarget = board[toCell(diagonalLeft)];
  if (leftTarget && leftTarget.color !== piece.color) {
    possiblePositions.push(diagonalLeft);
  }

  const rightTarget = board[toCell(diagonalRight)];
  if (rightTarget && rightTarget.color !== piece.color) {
    possiblePositions.push(diagonalRight);
  }

  return possiblePositions;
};

export const generators: Record<PieceClass, TargetCellGenerator> = {
  King: {
    generate: (source: Position, board: Board): string[] => {
      const positions: Position[] = [
        { column: source.column - 1, row: source.row - 1 },
        { column: source.column - 1, row: source.row },
        { column: source.column - 1, row: source.row + 1 },
        { column: source.column, row: source.row - 1 },
        { column: source.column, row: source.row + 1 },
        { column: source.column + 1, row: source.row - 1 },
        { column: source.column + 1, row: source.row },
        { column: source.column + 1, row: source.row + 1 },
      ];

      return positions
        .map(toCell)
        .filter(
          (c) =>
            (board[c] && board[c].color !== board[toCell(source)]!.color) ||
            !board[c],
        );
    },
  },
  Queen: {
    generate: (source: Position, board: Board): string[] => {
      const validCardinals = generateValidCardinalPositions(board, source);
      const validDiagonals = generateValidDiagonalPositions(board, source);
      const allValidPositions = [...validCardinals, ...validDiagonals];
      return allValidPositions.map(toCell);
    },
  },
  Bishop: {
    generate: (source: Position, board: Board): string[] => {
      return generateValidDiagonalPositions(board, source).map(toCell);
    },
  },
  Knight: {
    generate: (source: Position, board: Board): string[] => {
      const positions: Position[] = [
        { column: source.column - 1, row: source.row - 2 },
        { column: source.column + 1, row: source.row - 2 },
        { column: source.column - 1, row: source.row + 2 },
        { column: source.column + 1, row: source.row + 2 },
        { column: source.column - 2, row: source.row - 1 },
        { column: source.column - 2, row: source.row + 1 },
        { column: source.column + 2, row: source.row - 1 },
        { column: source.column + 2, row: source.row + 1 },
      ];

      return positions
        .map(toCell)
        .filter(
          (c) =>
            (board[c] && board[c].color !== board[toCell(source)]!.color) ||
            !board[c],
        );
    },
  },
  Rook: {
    generate: (source: Position, board: Board): string[] => {
      return generateValidCardinalPositions(board, source).map(toCell);
    },
  },
  Pawn: {
    generate: (source: Position, board: Board): string[] => {
      return generateValidPawnPositions(board, source).map(toCell);
    },
  },
};
