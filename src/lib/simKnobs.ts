export type SimKnobs = {
  startReputation: number;
  startTreasury: number;
  attackRampMul: number;
  breachRepScale: number;
};

export const BUDGET_BASE_PCT = 0.022;
export const BUDGET_REP_DIVISOR = 5000;
export const UNUSED_CARRY_PCT = 0.35;

export function budgetRate(reputation: number) {
  return BUDGET_BASE_PCT + reputation / BUDGET_REP_DIVISOR;
}

export const DEFAULT_SIM_KNOBS: SimKnobs = {
  startReputation: 75,
  startTreasury: 0,
  attackRampMul: 1,
  breachRepScale: 1,
};

/** 3Q starts lower so two real breaches can end the interim appointment. */
export const INTERIM_START_REPUTATION = 20;
