import { RunnerGameService } from "chess-engine/runtime";
import { createRunnerGameApi } from "./api/createRunnerGameApi";

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const game = new RunnerGameService();
const api = createRunnerGameApi(game);

const health = api.getHealth();
assert(health.status === "ok", "health should be ok");

const presetKeys = api.getPresetKeys();
assert(presetKeys.presetKeys.length > 0, "preset keys should not be empty");

const preset = api.preset("LonelyPawn");
assert(preset.success, "preset should succeed");
assert(
  preset.board.E2?.class === "Pawn",
  "preset should place a white pawn on E2",
);

const validTargets = api.getValidTargets("E2");
assert(
  validTargets.targetCells.includes("E4"),
  "E2 pawn should be able to move to E4",
);

const move = api.move({ source: "E2", target: "E4" });
assert(move.success, "runner move should succeed");

if (move.success) {
  assert(move.board.E4?.class === "Pawn", "pawn should move to E4");
  assert(!move.board.E2, "E2 should be empty after the move");
}

const reset = api.reset();
assert(reset.success, "reset should succeed");
assert(
  reset.board.E2?.class === "Pawn",
  "reset should restore the starting board",
);

console.log("[SMOKE] Runner-only desktop API contract passed");
