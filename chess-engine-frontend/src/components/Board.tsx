import clsx from "clsx";
import styles from "./Board.module.css";
import { getPieceSvg } from "../utils/piece-svg-util";
import React from "react";
import type { EnrichedMove } from "../../../common/models/EnrichedMove";
import type { Piece, PieceClass } from "../../../common/models/Piece";
import { useBoard } from "../hooks/useBoard";
import type { BoardCellKey } from "../service/BoardService";
import { pieceDefinitionMap } from "../../../common/config/board-config";

const toLetter = (index: number) => {
  return String.fromCharCode(index + 65);
};

export const Board = () => {
  const [selectedFromCell, setSelectedFromCell] =
    React.useState<BoardCellKey | null>(null);
  const [selectedPresetKey, setSelectedPresetKey] = React.useState("");
  const [pendingPromotionMove, setPendingPromotionMove] = React.useState<{
    source: BoardCellKey;
    target: BoardCellKey;
    color: Piece["color"];
  } | null>(null);

  const promotionOptions: PieceClass[] = ["Queen", "Rook", "Bishop", "Knight"];

  const {
    board,
    isLoadingBoard,
    presetKeys,
    submitMove,
    resetGame,
    presetGame,
    validTargetCells,
    attackerCells,
    fetchValidTargetCells,
    fetchTargetingCells,
    clearValidTargetCells,
    clearAttackerCells,
  } = useBoard();

  React.useEffect(() => {
    if (presetKeys.length === 0) {
      setSelectedPresetKey("");
      return;
    }

    setSelectedPresetKey((current) =>
      current && presetKeys.includes(current) ? current : presetKeys[0]!,
    );
  }, [presetKeys]);

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
    if (pendingPromotionMove) {
      return;
    }

    if (!selectedFromCell) {
      const piece = getPiece(cellKey);
      if (!piece) {
        clearValidTargetCells();
        void fetchTargetingCells(cellKey);
        return;
      }

      clearAttackerCells();
      setSelectedFromCell(cellKey);
      void (async () => {
        const targetCells = await fetchValidTargetCells(cellKey);
        if (targetCells.length === 0) {
          setSelectedFromCell(null);
        }
      })();
    } else {
      const sourcePiece = getPiece(selectedFromCell);
      const targetPiece = getPiece(cellKey);

      if (cellKey === selectedFromCell) {
        handleClearClick();
        return;
      }

      if (
        sourcePiece &&
        targetPiece &&
        sourcePiece.color === targetPiece.color
      ) {
        clearValidTargetCells();
        clearAttackerCells();
        setSelectedFromCell(cellKey);
        void (async () => {
          const targetCells = await fetchValidTargetCells(cellKey);
          if (targetCells.length === 0) {
            setSelectedFromCell(null);
          }
        })();
        return;
      }

      void handleSubmitMove(selectedFromCell, cellKey);
    }
  };

  const handleClearClick = () => {
    setSelectedFromCell(null);
    setPendingPromotionMove(null);
    clearValidTargetCells();
    clearAttackerCells();
  };

  const isPromotionTarget = (
    piece: Piece,
    targetCell: BoardCellKey,
  ): boolean => {
    if (piece.class !== "Pawn") {
      return false;
    }

    const targetRank = Number.parseInt(targetCell[1], 10);
    const promotionRank = piece.color === "White" ? 8 : 1;
    return targetRank === promotionRank;
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
      clearAttackerCells();
      return;
    }

    if (isPromotionTarget(piece, targetCell)) {
      setPendingPromotionMove({
        source: sourceCell,
        target: targetCell,
        color: piece.color,
      });
      return;
    }

    const move: EnrichedMove = {
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

  const handlePromotionSelection = async (
    promoteTo: (typeof promotionOptions)[number],
  ) => {
    if (!pendingPromotionMove) {
      return;
    }

    const move: EnrichedMove = {
      source: pendingPromotionMove.source,
      target: pendingPromotionMove.target,
      metadata: {
        promoteTo,
      },
    };

    const result = await submitMove(move);
    if (!result.success) {
      alert(result.message);
      return;
    }

    handleClearClick();
  };

  const handlePromotionCancel = () => {
    setPendingPromotionMove(null);
  };

  const handleResetClick = async () => {
    const shouldReset = window.confirm(
      "Do you really want to reset the current game?",
    );

    if (!shouldReset) {
      return;
    }

    const result = await resetGame();
    if (!result.success) {
      alert(result.message);
      return;
    }

    handleClearClick();
  };

  const handlePresetClick = async () => {
    if (!selectedPresetKey) {
      alert("Please select a preset.");
      return;
    }

    const shouldPreset = window.confirm(
      "Do you really want to load a preset game?",
    );

    if (!shouldPreset) {
      return;
    }

    const result = await presetGame(selectedPresetKey);
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
                      attackerCells.includes(cellKey) && styles.cellAttacker,
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
        <input
          type="button"
          value={"Reset"}
          onClick={() => void handleResetClick()}
        />
        <select
          value={selectedPresetKey}
          onChange={(e) => setSelectedPresetKey(e.target.value)}
        >
          {presetKeys.map((presetKey) => (
            <option key={presetKey} value={presetKey}>
              {presetKey}
            </option>
          ))}
        </select>
        <input
          type="button"
          value={"Preset"}
          onClick={() => void handlePresetClick()}
          disabled={!selectedPresetKey}
        />
      </div>
      {pendingPromotionMove && (
        <div className={styles.promotionModalBackdrop}>
          <div className={styles.promotionModal}>
            <h2 className={styles.promotionTitle}>Choose Promotion Piece</h2>
            <div className={styles.promotionOptions}>
              {promotionOptions.map((pieceClass) => (
                <button
                  key={pieceClass}
                  type="button"
                  className={styles.promotionOptionButton}
                  onClick={() => void handlePromotionSelection(pieceClass)}
                >
                  <img
                    className={styles.promotionOptionImage}
                    src={getPieceSvg({
                      ...pieceDefinitionMap[pieceClass],
                      color: pendingPromotionMove.color,
                      id: `${pendingPromotionMove.color[0]}${pieceDefinitionMap[pieceClass].shortClass}@${pendingPromotionMove.target}`,
                    })}
                    alt={pieceClass}
                  />
                  <span>{pieceClass}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.promotionCancelButton}
              onClick={handlePromotionCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
