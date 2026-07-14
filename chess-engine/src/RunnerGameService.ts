import type { Move } from "@chess-engine/common/models/Move";
import { getPreset, getPresetKeys } from "./EnginePresets";
import { Runner } from "./Runner";

export class RunnerGameService {
  private runner: Runner;

  constructor(runner: Runner = new Runner()) {
    this.runner = runner;
  }

  getHealth() {
    return { status: "ok" as const };
  }

  getRunner() {
    return this.runner;
  }

  getBoard() {
    return this.runner.getEngine().getBoard().getBoard();
  }

  getValidTargets(source: string) {
    return this.runner.getEngine().getValidPositionsForPiece(source);
  }

  getTargetingCells(cell: string) {
    return this.runner.getEngine().getCellsThatTargetsCell(cell);
  }

  reset() {
    this.runner.reset();
    return this.getBoard();
  }

  move(move: Move) {
    this.runner.move(move);
    return this.getBoard();
  }

  getPresetKeys() {
    return getPresetKeys();
  }

  applyPreset(presetKey: string) {
    const presetKeys = this.getPresetKeys();

    if (!presetKeys.includes(presetKey)) {
      throw Error(`Invalid presetKey. Valid keys: ${presetKeys.join(", ")}`);
    }

    const engine = getPreset(presetKey as Parameters<typeof getPreset>[0]);
    this.runner.setEngine(engine);

    return this.getBoard();
  }
}
