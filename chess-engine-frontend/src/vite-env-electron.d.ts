import type { RunnerGameApi } from "./service/RunnerGameApi";

declare global {
  interface Window {
    runnerGameApi?: RunnerGameApi;
  }
}

export {};
