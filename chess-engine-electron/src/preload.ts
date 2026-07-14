import { contextBridge, ipcRenderer } from "electron";
import type { Move } from "@chess-engine/common/models/Move";

const runnerGameChannels = {
  health: "runner-game:health",
  board: "runner-game:board",
  validTargets: "runner-game:valid-targets",
  targetingCells: "runner-game:targeting-cells",
  reset: "runner-game:reset",
  presetKeys: "runner-game:preset-keys",
  preset: "runner-game:preset",
  move: "runner-game:move",
} as const;

const api = {
  getHealth: () => ipcRenderer.invoke(runnerGameChannels.health),
  getBoard: () => ipcRenderer.invoke(runnerGameChannels.board),
  getValidTargets: (source: string) =>
    ipcRenderer.invoke(runnerGameChannels.validTargets, source),
  getTargetingCells: (cell: string) =>
    ipcRenderer.invoke(runnerGameChannels.targetingCells, cell),
  reset: () => ipcRenderer.invoke(runnerGameChannels.reset),
  getPresetKeys: () => ipcRenderer.invoke(runnerGameChannels.presetKeys),
  preset: (presetKey: string) =>
    ipcRenderer.invoke(runnerGameChannels.preset, presetKey),
  move: (move: Move) => ipcRenderer.invoke(runnerGameChannels.move, move),
};

contextBridge.exposeInMainWorld("runnerGameApi", api);
