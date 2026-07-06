import { EngineBuilder } from "./EngineBuilder";

const builder = new EngineBuilder();

export const EnginePresets = {
  LonelyPawn: () => {
    return builder
      .reset()
      .set("White", "King", "E1")
      .set("Black", "King", "E8")
      .set("White", "Pawn", "E2")
      .build();
  },

  TheTwoTowers: () => {
    return builder
      .reset()
      .set("White", "King", "E1")
      .set("Black", "King", "H8")
      .set("White", "Rook", "E4")
      .set("Black", "Rook", "E8")
      .build();
  },

  TheTwoTowersInverted: () => {
    return builder
      .reset()
      .set("Black", "King", "E1")
      .set("White", "King", "H8")
      .set("Black", "Rook", "E4")
      .set("White", "Rook", "E8")
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
