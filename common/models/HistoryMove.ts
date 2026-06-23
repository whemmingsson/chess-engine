import { Move } from "./Move";

export type MoveMetaData = object;

export interface HistoryMove extends Move {
  metadata?: MoveMetaData;
}
