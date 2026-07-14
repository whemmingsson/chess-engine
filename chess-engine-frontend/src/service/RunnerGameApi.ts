import type { EnrichedMove } from "@chess-engine/common/models/EnrichedMove";
import type {
  BoardCellKey,
  BoardResponse,
  HealthResponse,
  MoveResponse,
  PresetKeysResponse,
  PresetResponse,
  ResetResponse,
  TargetingCellsResponse,
  ValidTargetsResponse,
} from "./BoardService";

export interface RunnerGameApi {
  getHealth: () => Promise<HealthResponse>;
  getBoard: () => Promise<BoardResponse>;
  getValidTargets: (source: BoardCellKey) => Promise<ValidTargetsResponse>;
  getTargetingCells: (cell: BoardCellKey) => Promise<TargetingCellsResponse>;
  reset: () => Promise<ResetResponse>;
  getPresetKeys: () => Promise<PresetKeysResponse>;
  preset: (presetKey: string) => Promise<PresetResponse>;
  move: (move: EnrichedMove) => Promise<MoveResponse>;
}
