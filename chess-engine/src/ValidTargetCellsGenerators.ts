import { Board } from "./types/Board";
import { Position } from "./types/Position";
import { otherColor, toCell, toPosition } from "./utils/ConversionUtils";
import { PieceClass } from "../../common/models/Piece";
import { Move } from "../../common/models/Move";

type TargetCellGenerator = {
  generate: (
    source: Position,
    board: Board,
    history?: Move[],
    movedPieces?: Set<string>,
  ) => string[];
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

const generateValidPawnPositions = (
  board: Board,
  source: Position,
  lastMove: Move | undefined,
) => {
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

  // Basic move logic + capture

  if (!board[toCell(forwardOne)]) {
    possiblePositions.push(forwardOne);
  }

  if (firstMove && !board[toCell(forwardOne)] && !board[toCell(forwardTwo)]) {
    possiblePositions.push(forwardTwo);
  }

  const diagonalLeftTarget = board[toCell(diagonalLeft)];
  if (diagonalLeftTarget && diagonalLeftTarget.color !== piece.color) {
    possiblePositions.push(diagonalLeft);
  }

  const diagnoalRightTarget = board[toCell(diagonalRight)];
  if (diagnoalRightTarget && diagnoalRightTarget.color !== piece.color) {
    possiblePositions.push(diagonalRight);
  }

  // First move - en passant is not possible
  if (!lastMove) {
    return possiblePositions;
  }

  // Last move was NOT a pawn - en passant is not possible
  if (
    lastMove &&
    board[lastMove.target] &&
    board[lastMove.target]?.class !== "Pawn"
  ) {
    return possiblePositions;
  }

  // Last move was a pawn - but the same color as the current moving pawn (should not really happen but whatever)
  if (
    lastMove &&
    board[lastMove.target] &&
    board[lastMove.target]?.class === "Pawn" &&
    board[lastMove.target]?.color === piece.color
  ) {
    return possiblePositions;
  }

  // Last move was a pawn, but not a 2-step initial move
  const lastMoveSourcePosition = toPosition(lastMove.source);
  const lastMoveTargetPosition = toPosition(lastMove.target);
  if (
    lastMove &&
    board[lastMove.target] &&
    board[lastMove.target]?.class === "Pawn" &&
    board[lastMove.target]?.color !== piece.color &&
    (Math.abs(lastMoveTargetPosition.row - lastMoveSourcePosition.row) !== 2 ||
      lastMoveSourcePosition.column !== lastMoveTargetPosition.column)
  ) {
    return possiblePositions;
  }

  // En passant logic
  const right = {
    column: source.column + 1,
    row: source.row,
  };

  const left = {
    column: source.column - 1,
    row: source.row,
  };

  const rightCell = toCell(right);
  const rightTarget = board[rightCell];
  const enPassantRightPosition = {
    column: right.column,
    row: source.row + direction,
  };

  if (
    rightTarget &&
    rightTarget.class === "Pawn" &&
    rightCell === lastMove?.target &&
    !board[toCell(enPassantRightPosition)]
  ) {
    possiblePositions.push(enPassantRightPosition);
  }

  const leftCell = toCell(left);
  const leftTarget = board[leftCell];
  const enPassantLeftPosition = {
    column: left.column,
    row: source.row + direction,
  };

  if (
    leftTarget &&
    leftTarget.class === "Pawn" &&
    leftCell === lastMove?.target &&
    !board[toCell(enPassantLeftPosition)]
  ) {
    possiblePositions.push(enPassantLeftPosition);
  }

  return possiblePositions;
};

export const generators: Record<PieceClass, TargetCellGenerator> = {
  King: {
    generate: (source: Position, board: Board, _, movedPieces): string[] => {
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

      console.log("Moved pieces:", movedPieces);

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
    generate: (source: Position, board: Board, history?: Move[]): string[] => {
      return generateValidPawnPositions(
        board,
        source,
        history?.at(history.length - 1),
      )
        .filter(
          (position) =>
            position.row >= 1 &&
            position.row <= 8 &&
            position.column >= 1 &&
            position.column <= 8,
        )
        .map(toCell);
    },
  },
};
