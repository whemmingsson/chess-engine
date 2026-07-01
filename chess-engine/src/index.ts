import express from "express";
import cors from "cors";
import { Engine, type EngineInstance } from "./Engine";
import type { Move } from "../../common/models/Move";
import { config } from "./config/config";

const app = express();
const engine: EngineInstance = new Engine();

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

app.get("/board", (_req, res) => {
  res.status(200).json({ board: engine.getBoard() });
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
    board: engine.getBoard(),
  });
});

app.post("/move", (req, res) => {
  try {
    const move = req.body as Move;
    engine.movePiece(move);

    res.status(200).json({
      success: true,
      board: engine.getBoard(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Move failed";
    res.status(400).json({
      success: false,
      message,
    });
  }
});

app.listen(config.server.port, () => {
  console.log(`[REST API] API server listening on port ${config.server.port}`);
});
