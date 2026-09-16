import { DEFENSES, STAFF_CAPACITY_PER_LEVEL } from './data';
import { GameEngine } from './game';
import { DEFAULT_SIM_KNOBS, type SimKnobs } from './simKnobs';

export type StrategyId = 'blind' | 'spray' | 'controlsOnly' | 'aligned' | 'maxed';

export const HABIT_COPY: Record<StrategyId, { label: string; hint: string }> = {
  blind: {
    label: 'Spend nothing',
    hint: 'No program: no threat modeling, no requirements, no controls.',
  },
  spray: {
    label: 'A little of everything',
    hint: 'A bit of every tool. No risk assessment or guidance for where or how to use them.',
  },
  controlsOnly: {
    label: 'Tools, no assessment or guide',
    hint: 'Buy a tool stack with no risk assessment. Controls apply generically. Residual risk stays at industry rates.',
  },
  aligned: {
    label: 'Assessment + guide + tools',
    hint: 'Risk assessment, guidance, and the matching tools. The team knows where and how to use them.',
  },
  maxed: {
    label: 'Max every tool',
    hint: 'Spend until every tool is maxed. Assessment and guidance get leftovers. Extra products add noise, not safety.',
  },
};

export interface PlayResult {
  strategy: StrategyId;
  seed: number;
  turns: number;
  breaches: number;
  blocked: number;
  contained: number;
  quietBonus: number;
  score: number;
  spent: number;
  attackCost: number;
  revenue: number;
  reputation: number;
  fired: boolean;
  degradations: number;
  grade: string;
  tm: number;
  rm: number;
  maxedCaps: number;
  capSum: number;
  capCount: number;
  attacks: number;
}

export const SCENARIO_SEEDS = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89] as const;

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buyTo(game: GameEngine, key: string, level: number): void {
  while ((game.defenses[key] || 0) + (game.pendingUpgrades[key] || 0) < level) {
    if (!game.queueUpgrade(key)) break;
  }
}

function buyCapsTo(game: GameEngine, maxLevel: number): void {
  const order = Object.keys(DEFENSES).filter(k => DEFENSES[k].type === 'capability');
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const key of order) {
      const have = (game.defenses[key] || 0) + (game.pendingUpgrades[key] || 0);
      if (have >= maxLevel) continue;
      if (game.queueUpgrade(key)) progressed = true;
    }
  }
}

function applyStrategy(game: GameEngine, strategy: StrategyId): void {
  if (strategy === 'blind') return;

  if (strategy === 'spray') {
    buyCapsTo(game, 2);
    return;
  }

  if (strategy === 'controlsOnly') {
    buyCapsTo(game, 3);
    return;
  }

  if (strategy === 'maxed') {
    buyCapsTo(game, 5);
    buyTo(game, 'threatModel', 1);
    buyTo(game, 'reqMgmt', 1);
    return;
  }

  const program = game.getProgramTarget();
  buyTo(game, 'threatModel', program);
  buyTo(game, 'reqMgmt', program);
  if (game.threatModelLevel > 0) {
    const targets = game.getTargetLevels();
    for (const [key, t] of Object.entries(targets)) {
      if (key === 'threatModel' || key === 'reqMgmt') continue;
      buyTo(game, key, t.target);
    }
  } else {
    buyTo(game, 'identity', 1);
    buyTo(game, 'awareness', 1);
  }
  const staffNeed = Math.ceil(game.getAlertLoad() / STAFF_CAPACITY_PER_LEVEL);
  buyTo(game, 'secTeam', Math.min(5, Math.max(1, staffNeed)));
}

export function play(strategy: StrategyId, seed: number, maxTurns = 20, knobs?: Partial<SimKnobs>): PlayResult {
  const rng = mulberry32(seed);
  const orig = Math.random;
  Math.random = rng;
  try {
    const game = new GameEngine();
    game.reset(maxTurns);
    if (knobs) {
      game.knobs = { ...DEFAULT_SIM_KNOBS, ...knobs };
      game.reset(maxTurns);
    }
    game.phase = 'budget';
    while (game.phase !== 'gameover' && game.turn <= maxTurns) {
      game.phase = 'budget';
      applyStrategy(game, strategy);
      game.endQuarter();
      if (game.phase === 'gameover') break;
      game.nextTurn();
    }
    const capKeys = Object.keys(DEFENSES).filter(k => DEFENSES[k].type === 'capability');
    const capSum = capKeys.reduce((s, k) => s + (game.defenses[k] || 0), 0);
    const maxedCaps = capKeys.filter(k => (game.defenses[k] || 0) >= 5).length;
    return {
      strategy,
      seed,
      turns: game.turn,
      breaches: game.totalBreaches,
      blocked: game.totalBlocked,
      contained: game.totalContained,
      quietBonus: game.quietBonus,
      score: game.getScore(),
      spent: game.totalSpent,
      attackCost: game.totalAttackCost,
      revenue: game.revenue,
      reputation: game.reputation,
      fired: game.reputation <= 0,
      degradations: game.totalDegradationEvents,
      grade: game.getGrade(),
      tm: game.defenses.threatModel || 0,
      rm: game.defenses.reqMgmt || 0,
      maxedCaps,
      capSum,
      capCount: capKeys.length,
      attacks: game.totalAttacks,
    };
  } finally {
    Math.random = orig;
  }
}

export function average(rows: PlayResult[], horizon = 20): Omit<PlayResult, 'strategy' | 'seed' | 'grade' | 'fired'> & { fireRate: number; ipoRate: number } {
  const n = rows.length;
  const sum = rows.reduce((a, r) => ({
    turns: a.turns + r.turns,
    breaches: a.breaches + r.breaches,
    blocked: a.blocked + r.blocked,
    contained: a.contained + r.contained,
    quietBonus: a.quietBonus + r.quietBonus,
    score: a.score + r.score,
    spent: a.spent + r.spent,
    attackCost: a.attackCost + r.attackCost,
    revenue: a.revenue + r.revenue,
    reputation: a.reputation + r.reputation,
    degradations: a.degradations + r.degradations,
    tm: a.tm + r.tm,
    rm: a.rm + r.rm,
    maxedCaps: a.maxedCaps + r.maxedCaps,
    capSum: a.capSum + r.capSum,
    capCount: a.capCount + r.capCount,
    attacks: a.attacks + r.attacks,
  }), {
    turns: 0, breaches: 0, blocked: 0, contained: 0, quietBonus: 0, score: 0,
    spent: 0, attackCost: 0, revenue: 0, reputation: 0, degradations: 0, tm: 0, rm: 0,
    maxedCaps: 0, capSum: 0, capCount: 0, attacks: 0,
  });
  return {
    turns: sum.turns / n,
    breaches: sum.breaches / n,
    blocked: sum.blocked / n,
    contained: sum.contained / n,
    quietBonus: sum.quietBonus / n,
    score: sum.score / n,
    spent: sum.spent / n,
    attackCost: sum.attackCost / n,
    revenue: sum.revenue / n,
    reputation: sum.reputation / n,
    degradations: sum.degradations / n,
    tm: sum.tm / n,
    rm: sum.rm / n,
    maxedCaps: sum.maxedCaps / n,
    capSum: sum.capSum / n,
    capCount: sum.capCount / n,
    attacks: sum.attacks / n,
    fireRate: rows.filter(r => r.fired).length / n,
    ipoRate: rows.filter(r => r.turns >= horizon && !r.fired).length / n,
  };
}

export function runLab(
  ids: StrategyId[],
  seedCount: number,
  knobs?: Partial<SimKnobs>,
  maxTurns = 8,
): Record<string, ReturnType<typeof average> & { label: string; survival: number[] }> {
  const seeds = Array.from({ length: seedCount }, (_, i) => i + 1);
  const out: Record<string, ReturnType<typeof average> & { label: string; survival: number[] }> = {};
  for (const id of ids) {
    const rows = seeds.map(seed => play(id, seed, maxTurns, knobs));
    const survival = Array.from({ length: maxTurns }, (_, i) => {
      const t = i + 1;
      return rows.filter(r => (r.fired ? t < r.turns : true)).length / rows.length * 100;
    });
    out[id] = { ...average(rows, maxTurns), label: HABIT_COPY[id].label, survival };
  }
  return out;
}

export function runSuite(seeds: readonly number[] = SCENARIO_SEEDS): Record<StrategyId, PlayResult[]> {
  const ids: StrategyId[] = ['blind', 'spray', 'controlsOnly', 'aligned', 'maxed'];
  const out = {} as Record<StrategyId, PlayResult[]>;
  for (const id of ids) out[id] = seeds.map(seed => play(id, seed));
  return out;
}
