export type SimKnobs = {
  startReputation: number;
  startTreasury: number;
  attackRampMul: number;
  breachRepScale: number;
};

export const DEFAULT_SIM_KNOBS: SimKnobs = {
  startReputation: 75,
  startTreasury: 0,
  attackRampMul: 1,
  breachRepScale: 1,
};
