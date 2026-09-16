import { beforeAll, describe, expect, it } from 'vitest';
import { DEFENSES } from './data';
import { GameEngine } from './game';
import { average, play, runLab, runSuite, SCENARIO_SEEDS } from './cisoScenarios';
import { loadWeaknessCatalog } from './cisoCatalog';

beforeAll(() => {
  loadWeaknessCatalog();
});

describe('CISO engine invariants', () => {
  it('raises attack pressure with revenue', () => {
    const g = new GameEngine();
    const base = g.getAttackPressure();
    g.revenue = 10000;
    expect(g.getAttackPressure()).toBeGreaterThan(base);
  });

  it('raises program target as products arrive', () => {
    const g = new GameEngine();
    expect(g.getProgramTarget()).toBe(1);
    g.products.tick(3);
    g.products.tick(5);
    g.products.tick(8);
    expect(g.getProgramTarget()).toBeGreaterThanOrEqual(2);
  });

  it('cuts upkeep when TM and requirements match a defense', () => {
    const raw = new GameEngine();
    raw.defenses.identity = 2;
    raw.defenses.grc = 1;
    const aligned = new GameEngine();
    aligned.defenses.identity = 2;
    aligned.defenses.grc = 1;
    aligned.defenses.threatModel = 2;
    aligned.defenses.reqMgmt = 2;
    const toolsUpkeep = 2 * DEFENSES.threatModel.maintainCost + 2 * DEFENSES.reqMgmt.maintainCost;
    const identityUpkeep = 2 * DEFENSES.identity.maintainCost;
    const identityDiscounted = 2 * Math.round(DEFENSES.identity.maintainCost * 0.55);
    expect(raw.getMaintenanceCost()).toBe(identityUpkeep);
    expect(aligned.getMaintenanceCost()).toBe(toolsUpkeep + identityDiscounted);
    const platform = raw.products.getLiveProducts()[0];
    expect(aligned.getMitigationEffectiveness('AUTH', platform)).toBeGreaterThan(raw.getMitigationEffectiveness('AUTH', platform));
  });

  it('skips degradation on aligned defenses', () => {
    const g = new GameEngine();
    g.turn = 5;
    g.defenses.identity = 2;
    g.defenses.threatModel = 2;
    g.defenses.reqMgmt = 2;
    g.deploymentTurns.identity = 1;
    const orig = Math.random;
    Math.random = () => 0;
    try {
      g._rollDegradation();
    } finally {
      Math.random = orig;
    }
    expect(g.quarterDegradations.some(d => d.key === 'identity')).toBe(false);
  });

  it('adds CISO score on a quiet quarter', () => {
    const g = new GameEngine();
    g.turnLog = [];
    g._applyGrowth();
    expect(g.quietBonus).toBe(100);
    expect(g.quietStreak).toBe(1);
    g.turnLog = [{ type: 'attack', data: { result: 'breach' } }];
    g._applyGrowth();
    expect(g.quietStreak).toBe(0);
  });

  it('gives more fix slots as staff and supervised agents grow', () => {
    const g = new GameEngine();
    g.defenses.reqMgmt = 1;
    expect(g.getFixCapacity()).toBe(0);
    expect(g.getLevelCap('secAgents')).toBe(0);
    g.defenses.secTeam = 1;
    expect(g.getFixCapacity()).toBe(1);
    expect(g.getLevelCap('secAgents')).toBe(0);
    g.defenses.secTeam = 2;
    g.defenses.secAgents = 2;
    expect(g.getSupervisedAgentCount()).toBe(1);
    expect(g.getFixCapacity()).toBe(2 + 1);
    g.defenses.secTeam = 3;
    expect(g.getSupervisedAgentCount()).toBe(2);
    expect(g.getFixCapacity()).toBe(3 + 2);
  });

  it('does not attack products that are not live', () => {
    const g = new GameEngine();
    g.products.tick(2);
    const ai = g.products.active.find(p => p.id === 'aifeature');
    expect(ai?.launched).toBe(false);
    const orig = Math.random;
    Math.random = () => 0;
    try {
      g.turn = 2;
      const attacks = g._rollAttacks();
      for (const a of attacks) {
        expect(a.vulnProducts.every((v: { id: string }) => v.id !== 'aifeature')).toBe(true);
      }
    } finally {
      Math.random = orig;
    }
  });

  it('does not attack a product the quarter it launches', () => {
    const g = new GameEngine();
    g.products.tick(2);
    g.products.tick(3);
    g.products.tick(4);
    expect(g.products.active.find(p => p.id === 'aifeature')?.launched).toBe(false);
    g.turn = 4;
    g.phase = 'budget';
    const orig = Math.random;
    Math.random = () => 0;
    try {
      g.endQuarter();
    } finally {
      Math.random = orig;
    }
    expect(g.products.active.find(p => p.id === 'aifeature')?.launched).toBe(true);
    const hit = g.turnLog
      .filter(e => e.type === 'attack')
      .flatMap(e => (e.data.vulnProducts || []).map((v: { id: string }) => v.id));
    expect(hit).not.toContain('aifeature');
  });
});

describe('CISO scenario suite (seeded)', () => {
  it('is bit-stable for the same seed', () => {
    const a = play('aligned', 13);
    const b = play('aligned', 13);
    expect(a).toEqual(b);
  });

  it('ranks strategies: aligned beats blind, spray wastes money vs aligned', () => {
    const suite = runSuite(SCENARIO_SEEDS);
    const blind = average(suite.blind);
    const aligned = average(suite.aligned);
    const spray = average(suite.spray);
    const maxed = average(suite.maxed);
    const noProgram = average(suite.controlsOnly);

    expect(aligned.tm).toBeGreaterThanOrEqual(1);
    expect(aligned.rm).toBeGreaterThanOrEqual(1);
    expect(blind.tm).toBe(0);
    expect(noProgram.tm).toBe(0);
    expect(noProgram.rm).toBe(0);
    expect(maxed.capSum).toBeGreaterThan(noProgram.capSum);

    expect(aligned.breaches).toBeLessThan(blind.breaches);
    expect(aligned.score).toBeGreaterThan(blind.score);
    expect(aligned.quietBonus).toBeGreaterThan(blind.quietBonus);

    expect(aligned.spent / aligned.turns).toBeLessThan(maxed.spent / maxed.turns);
    expect(aligned.attacks / aligned.turns).toBeLessThan(noProgram.attacks / noProgram.turns);
    expect(aligned.attacks / aligned.turns).toBeLessThan(maxed.attacks / maxed.turns);
    expect(aligned.attackCost / aligned.turns).toBeLessThan(noProgram.attackCost / noProgram.turns);
    expect(aligned.attackCost / aligned.turns).toBeLessThan(maxed.attackCost / maxed.turns);
    expect((aligned.spent + aligned.attackCost) / aligned.turns).toBeLessThan((maxed.spent + maxed.attackCost) / maxed.turns);
    expect(Object.keys(DEFENSES).length).toBeGreaterThan(5);

    expect(blind.fireRate).toBeGreaterThan(0.5);
    expect(aligned.fireRate).toBeLessThan(blind.fireRate);
    expect(aligned.fireRate).toBeLessThan(maxed.fireRate);
    expect(aligned.attacks / aligned.turns).toBeLessThan(maxed.attacks / maxed.turns);
    expect(noProgram.ipoRate).toBeLessThan(aligned.ipoRate);
    expect(aligned.ipoRate).toBeGreaterThanOrEqual(noProgram.ipoRate);
  });
});

describe('lab rates hold at 8Q and 20Q', () => {
  it.each([8, 20] as const)('%sQ: guide-then-apply lower attack and loss per quarter than tools-without-guidance', horizon => {
    const d = runLab(['controlsOnly', 'aligned', 'maxed'], 10, undefined, horizon);
    const a = d.aligned;
    const n = d.controlsOnly;
    const m = d.maxed;
    expect(a.attacks / a.turns).toBeLessThan(n.attacks / n.turns);
    expect(a.attackCost / a.turns).toBeLessThan(n.attackCost / n.turns);
    expect(a.attacks / a.turns).toBeLessThan(m.attacks / m.turns);
    expect(a.attackCost / a.turns).toBeLessThan(m.attackCost / m.turns);
  });
});

describe('guidance leverage', () => {
  it('generic controls apply at purchased level without TM', () => {
    const blind = new GameEngine();
    blind.defenses.identity = 4;
    const guided = new GameEngine();
    guided.defenses.identity = 4;
    guided.defenses.threatModel = 2;
    guided.defenses.reqMgmt = 2;
    expect(blind.getEffectiveDefenseLevel('identity')).toBe(4);
    expect(guided.getEffectiveDefenseLevel('identity')).toBe(4);
    const platform = blind.products.getLiveProducts()[0];
    expect(guided.getMitigationEffectiveness('AUTH', platform)).toBeGreaterThan(blind.getMitigationEffectiveness('AUTH', platform));
  });

  it('TM and requirements shrink attack volume and mitigation cost', () => {
    const none = new GameEngine();
    none.products.tick(3);
    none.products.tick(5);
    none.products.tick(8);
    none.defenses.identity = 2;
    none.defenses.siem = 2;
    none.defenses.appSec = 2;

    const guided = new GameEngine();
    guided.products.tick(3);
    guided.products.tick(5);
    guided.products.tick(8);
    guided.defenses.identity = 2;
    guided.defenses.siem = 2;
    guided.defenses.appSec = 2;
    guided.defenses.threatModel = 2;
    guided.defenses.reqMgmt = 2;
    guided.defenses.secTeam = 4;

    const gold = new GameEngine();
    gold.products.tick(3);
    gold.products.tick(5);
    gold.products.tick(8);
    gold.defenses.threatModel = 2;
    gold.defenses.reqMgmt = 2;
    for (const k of Object.keys(DEFENSES)) {
      if (DEFENSES[k].type === 'capability') gold.defenses[k] = 5;
    }

    expect(none.getGuidedSurfaceMul()).toBe(1);
    expect(guided.getGuidedSurfaceMul()).toBeLessThan(0.5);
    expect(guided.getMaintenanceCost()).toBeLessThan(gold.getMaintenanceCost());
  });

  it('threat model report works after assessment is bought', () => {
    const g = new GameEngine();
    g.defenses.threatModel = 1;
    const report = g.getThreatModelReport();
    expect(report.level).toBe('active');
    expect(report.coveragePct).toBeGreaterThanOrEqual(0);
  });
});
