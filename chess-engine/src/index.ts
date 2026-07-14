import express from "express";
import cors from "cors";
import { Engine, type EngineInstance } from "./Engine";
import type { Move } from "@chess-engine/common/models/Move";
import { config } from "./config/config";
import { getPreset, getPresetKeys } from "./EnginePresets";
import { RunnerGameService } from "./RunnerGameService";

const app = express();
let engine: EngineInstance = new Engine();
const runnerGame = new RunnerGameService();

app.use(
  cors({
    origin: config.server.frontendOrigin,
    credentials: config.server.allowCorsCredentials,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const createMoveHandler =
  (
    performMove: (move: Move) => void,
    getBoard: () => ReturnType<EngineInstance["getBoard"]>,
  ) =>
  (req: express.Request, res: express.Response) => {
    try {
      const move = req.body as Move;
      performMove(move);

      res.status(200).json({
        success: true,
        board: getBoard().getBoard(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Move failed";
      res.status(400).json({
        success: false,
        message,
      });
    }
  };

const runnerRouter = express.Router();

runnerRouter.get("/board", (_req, res) => {
  res.status(200).json({ board: runnerGame.getBoard() });
});

runnerRouter.get("/valid-targets/:source", (req, res) => {
  const { source } = req.params;
  const targetCells = runnerGame.getValidTargets(source);

  res.status(200).json({ targetCells });
});

runnerRouter.post("/reset", (_req, res) => {
  res.status(200).json({
    success: true,
    board: runnerGame.reset(),
  });
});

runnerRouter.post(
  "/move",
  createMoveHandler(
    (move) => runnerGame.move(move),
    () => runnerGame.getRunner().getEngine().getBoard(),
  ),
);

app.use("/runner", runnerRouter);

app.get("/board", (_req, res) => {
  res.status(200).json({ board: engine.getBoard().getBoard() });
});

app.get("/valid-targets/:source", (req, res) => {
  const { source } = req.params;
  const targetCells = engine.getValidPositionsForPiece(source);

  res.status(200).json({ targetCells });
});

app.get("/targeting-cells/:cell", (req, res) => {
  const { cell } = req.params;
  const cells = engine.getCellsThatTargetsCell(cell);

  res.status(200).json({ cells });
});

app.post("/reset", (_req, res) => {
  engine.resetGame();

  res.status(200).json({
    success: true,
    board: engine.getBoard().getBoard(),
  });
});

app.post("/preset", (_req, res) => {
  const presetKey = _req.query.presetKey;
  const presetKeys = getPresetKeys();

  if (typeof presetKey !== "string" || !presetKeys.includes(presetKey)) {
    res.status(400).json({
      success: false,
      message: `Invalid presetKey. Valid keys: ${presetKeys.join(", ")}`,
    });
    return;
  }

  const newEngine = getPreset(presetKey as Parameters<typeof getPreset>[0]);
  engine = newEngine;

  res.status(200).json({
    success: true,
    board: engine.getBoard().getBoard(),
  });
});

app.get("/preset-keys", (_req, res) => {
  res.status(200).json({
    presetKeys: getPresetKeys(),
  });
});

app.post("/move", (req, res) => {
  return createMoveHandler(
    (move) => engine.movePiece(move),
    () => engine.getBoard(),
  )(req, res);
});

app.listen(config.server.port, () => {
  console.log(`[REST API] API server listening on port ${config.server.port}`);
});
