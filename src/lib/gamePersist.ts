import { GameEngine } from './game';

const KEY = 'ciso-save-v2';

export function snapshotGame(game: GameEngine) {
  return {
    started: game.started,
    turn: game.turn,
    maxTurns: game.maxTurns,
    phase: game.phase,
    revenue: game.revenue,
    companyValue: game.companyValue,
    quarterlyBudget: game.quarterlyBudget,
    treasury: game.treasury,
    reputation: game.reputation,
    securityPosture: game.securityPosture,
    knobs: game.knobs,
    defenses: game.defenses,
    pendingUpgrades: game.pendingUpgrades,
    totalBreaches: game.totalBreaches,
    totalBlocked: game.totalBlocked,
    totalContained: game.totalContained,
    totalSpent: game.totalSpent,
    totalAttackCost: game.totalAttackCost,
    totalAttacks: game.totalAttacks,
    blindSpotBreaches: game.blindSpotBreaches,
    blindSpotRepLost: game.blindSpotRepLost,
    totalDegradationEvents: game.totalDegradationEvents,
    degradationBreaches: game.degradationBreaches,
    deploymentTurns: game.deploymentTurns,
    quarterDegradations: game.quarterDegradations,
    quietStreak: game.quietStreak,
    quietBonus: game.quietBonus,
    attackLog: game.attackLog,
    turnLog: game.turnLog,
    fullLog: game.fullLog,
    products: game.products.toJSON(),
    news: game.news.toJSON(),
  };
}

export function applySnapshot(game: GameEngine, snap: ReturnType<typeof snapshotGame>) {
  game.started = !!snap.started;
  game.turn = snap.turn ?? 1;
  game.maxTurns = snap.maxTurns ?? 8;
  game.phase = snap.phase ?? 'briefing';
  game.revenue = snap.revenue ?? game.revenue;
  game.companyValue = snap.companyValue ?? game.companyValue;
  game.quarterlyBudget = snap.quarterlyBudget ?? 0;
  game.treasury = snap.treasury ?? 0;
  game.reputation = snap.reputation ?? game.reputation;
  game.securityPosture = snap.securityPosture ?? 0;
  game.knobs = { ...game.knobs, ...(snap.knobs || {}) };
  game.defenses = { ...game.defenses, ...(snap.defenses || {}) };
  game.pendingUpgrades = snap.pendingUpgrades ?? {};
  game.totalBreaches = snap.totalBreaches ?? 0;
  game.totalBlocked = snap.totalBlocked ?? 0;
  game.totalContained = snap.totalContained ?? 0;
  game.totalSpent = snap.totalSpent ?? 0;
  game.totalAttackCost = snap.totalAttackCost ?? 0;
  game.totalAttacks = snap.totalAttacks ?? 0;
  game.blindSpotBreaches = snap.blindSpotBreaches ?? 0;
  game.blindSpotRepLost = snap.blindSpotRepLost ?? 0;
  game.totalDegradationEvents = snap.totalDegradationEvents ?? 0;
  game.degradationBreaches = snap.degradationBreaches ?? 0;
  game.deploymentTurns = snap.deploymentTurns ?? {};
  game.quarterDegradations = snap.quarterDegradations ?? [];
  game.quietStreak = snap.quietStreak ?? 0;
  game.quietBonus = snap.quietBonus ?? 0;
  game.attackLog = snap.attackLog ?? [];
  game.turnLog = snap.turnLog ?? [];
  game.fullLog = snap.fullLog ?? [];
  game.products.fromJSON(snap.products);
  game.products.quickLive = game.maxTurns <= 3;
  if (snap.news) game.news.fromJSON(snap.news);
  const phases = ['briefing', 'howto', 'budget', 'report', 'gameover'] as const;
  if (!phases.includes(game.phase as typeof phases[number])) {
    game.phase = game.started ? 'budget' : 'briefing';
  }
}

export function saveGame(game: GameEngine) {
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshotGame(game)));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadGame(game: GameEngine): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const snap = JSON.parse(raw);
    if (!snap || typeof snap !== 'object' || !Array.isArray(snap.products)) {
      clearGameSave();
      return false;
    }
    applySnapshot(game, snap);
    return true;
  } catch {
    try { game.reset(); } catch { /* ignore */ }
    clearGameSave();
    return false;
  }
}

export function clearGameSave() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function createEngine(): GameEngine {
  const game = new GameEngine();
  loadGame(game);
  return game;
}
