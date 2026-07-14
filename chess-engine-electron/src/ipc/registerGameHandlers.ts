import { ipcMain } from "electron";
import type { Move } from "@chess-engine/common/models/Move";
import type { RunnerGameService } from "chess-engine/runtime";
import { createRunnerGameApi } from "../api/createRunnerGameApi";
import { runnerGameChannels } from "./channels";

export const registerGameHandlers = (game: RunnerGameService) => {
  const api = createRunnerGameApi(game);

  ipcMain.handle(runnerGameChannels.health, () => {
    return api.getHealth();
  });

  ipcMain.handle(runnerGameChannels.board, () => {
    return api.getBoard();
  });

  ipcMain.handle(runnerGameChannels.validTargets, (_event, source: string) => {
    return api.getValidTargets(source);
  });

  ipcMain.handle(runnerGameChannels.targetingCells, (_event, cell: string) => {
    return api.getTargetingCells(cell);
  });

  ipcMain.handle(runnerGameChannels.reset, () => {
    return api.reset();
  });

  ipcMain.handle(runnerGameChannels.presetKeys, () => {
    return api.getPresetKeys();
  });

  ipcMain.handle(runnerGameChannels.preset, (_event, presetKey: string) => {
    return api.preset(presetKey);
  });

  ipcMain.handle(runnerGameChannels.move, (_event, move: Move) => {
    return api.move(move);
  });
};
