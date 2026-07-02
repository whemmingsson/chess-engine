import { EngineBuilder } from "./EngineBuilder";

export const EnginePresets = {
  LonelyPawn: () => {
    const builder = new EngineBuilder();
    return builder
      .set("White", "King", "E1")
      .set("Black", "King", "E8")
      .set("White", "Pawn", "E2")
      .build();
  },
};

export const getPresetKeys = () => {
  return Object.keys(EnginePresets);
};

export const getPreset = (key: keyof typeof EnginePresets) => {
  const preset = EnginePresets[key];

  if (!preset) {
    throw Error(`Unknown preset with key ${key}. Does it exist?`);
  }

  return preset();
};
