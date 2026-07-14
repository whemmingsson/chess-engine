import type { Move } from "@chess-engine/common/models/Move";
import type { RunnerGameService } from "chess-engine/runtime";

export const createRunnerGameApi = (game: RunnerGameService) => {
  return {
    getHealth() {
      return game.getHealth();
    },

    getBoard() {
      return { board: game.getBoard() };
    },

    getValidTargets(source: string) {
      return { targetCells: game.getValidTargets(source) };
    },

    getTargetingCells(cell: string) {
      return { cells: game.getTargetingCells(cell) };
    },

    reset() {
      return {
        success: true as const,
        board: game.reset(),
      };
    },

    getPresetKeys() {
      return { presetKeys: game.getPresetKeys() };
    },

    preset(presetKey: string) {
      return {
        success: true as const,
        board: game.applyPreset(presetKey),
      };
    },

    move(move: Move) {
      try {
        return {
          success: true as const,
          board: game.move(move),
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Move failed";
        return {
          success: false as const,
          message,
        };
      }
    },
  };
};
