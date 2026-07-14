import { BoardMap } from "./types/BoardMap";
import { Position } from "./types/Position";
import { otherColor, toCell, toPosition } from "./utils/ConversionUtils";
import { PieceClass } from "@chess-engine/common/models/Piece";
import { Move } from "@chess-engine/common/models/Move";
import { hasPieceMoved } from "@chess-engine/common/utils/MovedPiecesUtils";
import { areCellsTargeted, PieceTargets } from "./types/PieceTargets";
import { Board } from "./Board";

type TargetCellGenerator = {
  generate: (
    source: Position,
    board: Board,
    history?: Move[],
    movedPieces?: Set<string>,
    targetedCells?: PieceTargets[],
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
  const oppositeColor = otherColor(board.getPieceAt(source)!.color);
  const positions = [];
  let r = source.row + rInc;
  let c = source.column + cInc;
  while (rWhileFunc(r) && cWhileFunc(c)) {
    const position = { row: r, column: c };
    const cell = toCell(position);

    if (
      board.isEmptyAt(cell) ||
      board.getPieceAt(cell)!.color === oppositeColor
    ) {
      positions.push(position);
    }

    if (board.hasPieceAt(cell)) {
      break;
    }

    r += rInc;
    c += cInc;
  }

  return positions;
};

const generateValidDiagonalPositions = (board: Board, position: Position) => {
  const possiblePositions: Position[] = [];

  // Moving up-right
  possiblePositions.push(
    ...generateTargetCells(
      board,
      position,
      1,
      1,
      (r) => r <= 8,
      (c) => c <= 8,
    ),
  );

  // Moving down-left
  possiblePositions.push(
    ...generateTargetCells(
      board,
      position,
      -1,
      -1,
      (r) => r >= 1,
      (c) => c >= 1,
    ),
  );

  // Moving up-left
  possiblePositions.push(
    ...generateTargetCells(
      board,
      position,
      1,
      -1,
      (r) => r <= 8,
      (c) => c >= 1,
    ),
  );

  // Moving down-right
  possiblePositions.push(
    ...generateTargetCells(
      board,
      position,
      -1,
      1,
      (r) => r >= 1,
      (c) => c <= 8,
    ),
  );

  return possiblePositions;
};

const generateValidCardinalPositions = (board: Board, position: Position) => {
  const possiblePositions: Position[] = [];

  // Moving right
  possiblePositions.push(
    ...generateTargetCells(
      board,
      position,
      0,
      1,
      () => true,
      (c) => c <= 8,
    ),
  );

  // Moving left
  possiblePositions.push(
    ...generateTargetCells(
      board,
      position,
      0,
      -1,
      () => true,
      (c) => c >= 1,
    ),
  );

  // Moving up
  possiblePositions.push(
    ...generateTargetCells(
      board,
      position,
      1,
      0,
      (r) => r <= 8,
      () => true,
    ),
  );

  // Moving down
  possiblePositions.push(
    ...generateTargetCells(
      board,
      position,
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
  const piece = board.getPieceAt(sourceCell)!;
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

  if (board.isEmptyAt(forwardOne)) {
    possiblePositions.push(forwardOne);
  }

  if (firstMove && board.isEmptyAt(forwardOne) && board.isEmptyAt(forwardTwo)) {
    possiblePositions.push(forwardTwo);
  }

  const diagonalLeftTarget = board.getPieceAt(diagonalLeft);
  if (diagonalLeftTarget && diagonalLeftTarget.color !== piece.color) {
    possiblePositions.push(diagonalLeft);
  }

  const diagnoalRightTarget = board.getPieceAt(diagonalRight);
  if (diagnoalRightTarget && diagnoalRightTarget.color !== piece.color) {
    possiblePositions.push(diagonalRight);
  }

  // First move - en passant is not possible
  if (!lastMove) {
    return possiblePositions;
  }

  // Last move was NOT a pawn - en passant is not possible
  const lastMoveTargetPiece = board.getPieceAt(lastMove.target);

  if (lastMoveTargetPiece && lastMoveTargetPiece?.class !== "Pawn") {
    return possiblePositions;
  }

  // Last move was a pawn - but the same color as the current moving pawn (should not really happen but whatever)
  if (
    lastMoveTargetPiece &&
    lastMoveTargetPiece?.class === "Pawn" &&
    lastMoveTargetPiece?.color === piece.color
  ) {
    return possiblePositions;
  }

  // Last move was a pawn, but not a 2-step initial move
  const lastMoveSourcePosition = toPosition(lastMove.source);
  const lastMoveTargetPosition = toPosition(lastMove.target);
  if (
    lastMoveTargetPiece &&
    lastMoveTargetPiece?.class === "Pawn" &&
    lastMoveTargetPiece?.color !== piece.color &&
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
  const rightTarget = board.getPieceAt(rightCell);
  const enPassantRightPosition = {
    column: right.column,
    row: source.row + direction,
  };

  if (
    rightTarget &&
    rightTarget.class === "Pawn" &&
    rightCell === lastMove?.target &&
    board.isEmptyAt(enPassantRightPosition)
  ) {
    possiblePositions.push(enPassantRightPosition);
  }

  const leftCell = toCell(left);
  const leftTarget = board.getPieceAt(leftCell);
  const enPassantLeftPosition = {
    column: left.column,
    row: source.row + direction,
  };

  if (
    leftTarget &&
    leftTarget.class === "Pawn" &&
    leftCell === lastMove?.target &&
    board.isEmptyAt(enPassantLeftPosition)
  ) {
    possiblePositions.push(enPassantLeftPosition);
  }

  return possiblePositions;
};

const outOfBounds = (p: Position) => {
  return p.row < 1 || p.row > 8 || p.column < 1 || p.column > 8;
};

export const generators: Record<PieceClass, TargetCellGenerator> = {
  King: {
    generate: (
      source: Position,
      board: Board,
      _,
      movedPieces,
      targetedCells,
    ): string[] => {
      // Standard positions
      const positions: Position[] = [
        { column: source.column - 1, row: source.row - 1 },
        { column: source.column - 1, row: source.row },
        { column: source.column - 1, row: source.row + 1 },
        { column: source.column, row: source.row - 1 },
        { column: source.column, row: source.row + 1 },
        { column: source.column + 1, row: source.row - 1 },
        { column: source.column + 1, row: source.row },
        { column: source.column + 1, row: source.row + 1 },
      ].filter((p) => !outOfBounds(p));

      const filteredPositions = positions
        .map(toCell)
        .filter(
          (c) =>
            board.getPieceAt(c)?.color !== board.getPieceAt(source)!.color ||
            board.isEmptyAt(c),
        );

      // Castling
      if (hasPieceMoved(board.getPieceAt(source), movedPieces)) {
        return filteredPositions;
      }

      const canCastle = (
        rookCol: number,
        safeCols: number[],
        emptyCols: number[],
      ) => {
        const { row } = source;
        const rookPos = { row: source.row, column: rookCol };
        const rookCell = toCell(rookPos);
        const cellsToBeSafe = [
          source,
          ...safeCols.map((c) => {
            return { row, column: c };
          }),
        ].map(toCell);
        const cellsToBeEmpty = [
          ...emptyCols.map((c) => {
            return { row, column: c };
          }),
        ].map(toCell);

        const maybeRook = board.getPieceAt(rookCell);

        return (
          maybeRook?.class === "Rook" &&
          !hasPieceMoved(maybeRook, movedPieces) &&
          cellsToBeEmpty.every((c) => board.isEmptyAt(c)) &&
          !areCellsTargeted(targetedCells, cellsToBeSafe)
        );
      };

      // Kingside
      if (canCastle(8, [6, 7], [6, 7])) {
        filteredPositions.push(toCell({ row: source.row, column: 7 }));
      }

      // Queenside
      if (canCastle(1, [3, 4], [2, 3, 4])) {
        filteredPositions.push(toCell({ row: source.row, column: 3 }));
      }

      return filteredPositions;
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
      ].filter((p) => !outOfBounds(p));

      return positions
        .map(toCell)
        .filter(
          (c) =>
            board.getPieceAt(c)?.color !== board.getPieceAt(source)!.color ||
            board.isEmptyAt(c),
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
        .filter((p) => !outOfBounds(p))
        .map(toCell);
    },
  },
};
