import { useCallback, useEffect, useState } from "react";
import type { Move } from "../../../common/models/Move";
import { toast } from "react-toastify";
import {
  BoardService,
  type BoardMap,
  type MoveResponse,
  type BoardCellKey,
} from "../service/BoardService";

type SubmitMoveResult = { success: true } | { success: false; message: string };

export const useBoard = () => {
  const [board, setBoard] = useState<BoardMap | null>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [presetKeys, setPresetKeys] = useState<string[]>([]);
  const [validTargetCells, setValidTargetCells] = useState<BoardCellKey[]>([]);
  const [attackerCells, setAttackerCells] = useState<BoardCellKey[]>([]);

  const fetchBoard = useCallback(async () => {
    const boardResponse = await BoardService.getBoard();
    setBoard(boardResponse.board);
  }, []);

  const submitMove = useCallback(
    async (move: Move): Promise<SubmitMoveResult> => {
      try {
        const moveResponse: MoveResponse = await BoardService.move(move);

        if (!moveResponse.success) {
          return { success: false, message: moveResponse.message };
        }

        await fetchBoard();
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to move piece";
        return { success: false, message };
      }
    },
    [fetchBoard],
  );

  const resetGame = useCallback(async (): Promise<SubmitMoveResult> => {
    try {
      await BoardService.reset();
      await fetchBoard();
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reset game";
      return { success: false, message };
    }
  }, [fetchBoard]);

  const presetGame = useCallback(
    async (presetKey: string): Promise<SubmitMoveResult> => {
      try {
        await BoardService.preset(presetKey);
        await fetchBoard();
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load preset game";
        return { success: false, message };
      }
    },
    [fetchBoard],
  );

  const fetchPresetKeys = useCallback(async () => {
    try {
      const response = await BoardService.getPresetKeys();
      setPresetKeys(response.presetKeys);
    } catch (error) {
      console.error("Error fetching preset keys:", error);
      setPresetKeys([]);
    }
  }, []);

  const fetchValidTargetCells = useCallback(async (source: BoardCellKey) => {
    try {
      const response = await BoardService.getValidTargets(source);
      setValidTargetCells(response.targetCells);

      if (response.targetCells.length === 0) {
        toast.info("This piece cannot move.");
      }

      return response.targetCells;
    } catch (error) {
      console.error("Error fetching valid target cells:", error);
      setValidTargetCells([]);
      return [] as BoardCellKey[];
    }
  }, []);

  const fetchTargetingCells = useCallback(async (cell: BoardCellKey) => {
    try {
      const response = await BoardService.getTargetingCells(cell);
      setAttackerCells(response.cells);
    } catch (error) {
      console.error("Error fetching targeting cells:", error);
      setAttackerCells([]);
    }
  }, []);

  const clearValidTargetCells = useCallback(() => {
    setValidTargetCells([]);
  }, []);

  const clearAttackerCells = useCallback(() => {
    setAttackerCells([]);
  }, []);

  useEffect(() => {
    const initializeBoard = async () => {
      try {
        await Promise.all([fetchBoard(), fetchPresetKeys()]);
      } catch (error) {
        console.error("Error fetching board:", error);
      } finally {
        setIsLoadingBoard(false);
      }
    };

    void initializeBoard();
  }, [fetchBoard, fetchPresetKeys]);

  return {
    board,
    isLoadingBoard,
    presetKeys,
    submitMove,
    resetGame,
    presetGame,
    refreshBoard: fetchBoard,
    validTargetCells,
    attackerCells,
    fetchValidTargetCells,
    fetchTargetingCells,
    clearValidTargetCells,
    clearAttackerCells,
  };
};
