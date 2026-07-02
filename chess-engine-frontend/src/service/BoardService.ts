import axios from "axios";
import type { EnrichedMove } from "../../../common/models/EnrichedMove";
import type { Piece } from "../../../common/models/Piece";

type BoardFile = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
type BoardRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type BoardCellKey = `${BoardFile}${BoardRank}`;
export type BoardMap = Record<BoardCellKey, Piece | null>;

export interface HealthResponse {
  status: string;
}

export interface BoardResponse {
  board: BoardMap;
}

export interface ValidTargetsResponse {
  targetCells: BoardCellKey[];
}

export interface TargetingCellsResponse {
  cells: BoardCellKey[];
}

export interface PresetKeysResponse {
  presetKeys: string[];
}

export interface MoveSuccessResponse {
  success: true;
  board: BoardMap;
}

export interface MoveFailureResponse {
  success: false;
  message: string;
}

export type MoveResponse = MoveSuccessResponse | MoveFailureResponse;
export type ResetResponse = MoveSuccessResponse;
export type PresetResponse = MoveSuccessResponse;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  timeout: 5000,
});

export const BoardService = {
  async getHealth(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>("/health");
    return response.data;
  },

  async getBoard(): Promise<BoardResponse> {
    const response = await api.get<BoardResponse>("/board");
    return response.data;
  },

  async getValidTargets(source: BoardCellKey): Promise<ValidTargetsResponse> {
    const response = await api.get<ValidTargetsResponse>(
      `/valid-targets/${source}`,
    );
    return response.data;
  },

  async getTargetingCells(cell: BoardCellKey): Promise<TargetingCellsResponse> {
    const response = await api.get<TargetingCellsResponse>(
      `/targeting-cells/${cell}`,
    );
    return response.data;
  },

  async reset(): Promise<ResetResponse> {
    const response = await api.post<ResetResponse>("/reset");
    return response.data;
  },

  async getPresetKeys(): Promise<PresetKeysResponse> {
    const response = await api.get<PresetKeysResponse>("/preset-keys");
    return response.data;
  },

  async preset(presetKey: string): Promise<PresetResponse> {
    const response = await api.post<PresetResponse>(
      `/preset?presetKey=${encodeURIComponent(presetKey)}`,
    );
    return response.data;
  },

  async move(move: EnrichedMove): Promise<MoveResponse> {
    try {
      const response = await api.post<MoveSuccessResponse>("/move", move);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError<MoveFailureResponse>(error)) {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 400 && data?.success === false) {
          return data;
        }
      }

      throw error;
    }
  },
};
