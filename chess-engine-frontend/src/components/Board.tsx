import clsx from "clsx";
import styles from "./Board.module.css";
import { getPieceSvg } from "../utils/piece-svg-util";
import React from "react";
import type { Move } from "../../../common/models/Move";
import type { Piece } from "../../../common/models/Piece";
import { useBoard } from "../hooks/useBoard";
import type { BoardCellKey } from "../service/BoardService";

const toLetter = (index: number) => {
  return String.fromCharCode(index + 65);
};

export const Board = () => {
  const [selectedFromCell, setSelectedFromCell] =
    React.useState<BoardCellKey | null>(null);

  const {
    board,
    isLoadingBoard,
    submitMove,
    validTargetCells,
    fetchValidTargetCells,
    clearValidTargetCells,
  } = useBoard();

  const getPiece = React.useCallback(
    (cellKey: BoardCellKey): Piece | null => {
      if (!board) {
        return null;
      }

      return board[cellKey];
    },
    [board],
  );

  const handleCellClick = (cellKey: BoardCellKey) => {
    if (!selectedFromCell) {
      const piece = getPiece(cellKey);
      if (!piece) {
        return;
      }

      setSelectedFromCell(cellKey);
      void fetchValidTargetCells(cellKey);
    } else {
      void handleSubmitMove(selectedFromCell, cellKey);
    }
  };

  const handleClearClick = () => {
    setSelectedFromCell(null);
    clearValidTargetCells();
  };

  const handleSubmitMove = async (
    sourceCell: BoardCellKey,
    targetCell: BoardCellKey,
  ) => {
    const piece = getPiece(sourceCell);
    if (!piece) {
      alert(`No piece at ${sourceCell}`);
      setSelectedFromCell(null);
      clearValidTargetCells();
      return;
    }

    const move: Move = {
      source: sourceCell,
      target: targetCell,
    };

    const result = await submitMove(move);
    if (!result.success) {
      alert(result.message);
      return;
    }

    handleClearClick();
  };

  if (isLoadingBoard || !board) {
    return <div>Loading board...</div>;
  }

  return (
    <div>
      <div className={styles.board}>
        {Array.from({ length: 8 }).map((_, i) => {
          const r = 8 - i;

          return (
            <div key={i} className={styles.row}>
              {Array.from({ length: 8 }).map((_, j) => {
                const isWhite = j % 2 === 0 ? r % 2 == 0 : r % 2 !== 0;
                const cellLetter = toLetter(j);
                const cellKey = `${cellLetter}${r}` as BoardCellKey;
                const piece = getPiece(cellKey);

                return (
                  <div
                    key={i + "_" + j}
                    className={clsx(
                      styles.cell,
                      isWhite ? styles.cellWhite : styles.cellBlack,
                      selectedFromCell === cellKey && styles.cellSelectedFrom,
                      validTargetCells.includes(cellKey) &&
                        styles.cellValidTarget,
                    )}
                    onClick={() => {
                      handleCellClick(cellKey);
                    }}
                  >
                    <span className={styles.cellIndex}>{cellKey}</span>
                    {piece && (
                      <img
                        className={styles.cellImage}
                        src={getPieceSvg(piece)}
                        alt={`${piece.color} ${piece.class}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div>
        <input
          type="button"
          value={"Clear"}
          onClick={() => handleClearClick()}
        />
      </div>
    </div>
  );
};
