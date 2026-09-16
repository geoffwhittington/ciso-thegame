import {
  WEAKNESSES, ATTACKS, DEFENSES, MAX_DEFENSE_LEVEL, EVENTS, MILESTONES,
  DEGRADATION_EVENTS, DEGRADATION_BASE_PROB, DEGRADATION_STAFF_REDUCTION, DEGRADATION_MAX_PER_QUARTER,
  STAFF_CAPACITY_PER_LEVEL, FALSE_POSITIVE_COST_PER_UNIT, industryLossK,
  DEFENSE_DEPENDENCIES, TEAM_MEMBERS_PER_CHAMPION, HOURS_PER_TEAM_MEMBER, AGENT_TEAM_MEMBERS_PER_LEVEL,
  type DegradationEvent,
} from './data';
import { ProductPipeline, type Product } from './products';
import { REQUIREMENTS } from './security';
import { NewsFeed } from './news';
import { DEFAULT_SIM_KNOBS, type SimKnobs } from './simKnobs';
import { GUIDED_BREACH_LOSS_MUL, GUIDED_UPKEEP_MUL, SDL_ATTACK_REMAINING } from './guidanceEvidence';
import { urlForCitation } from './sources';

// ─── TYPES ───────────────────────────────────────────────
export interface Recommendation {
  icon: string;
  title: string;
  detail: string;
  actionType: 'upgrade' | 'mitigate' | 'train' | 'info';
  actionKey?: string;
  productId?: string;
  weaknessKey?: string;
  cost: number;
  sourceLabel?: string;
  sourceUrl?: string;
}

export interface ScoreBreakdown {
  survivalPts: number;
  valuationPts: number;
  reputationPts: number;
  posturePts: number;
  blockedPts: number;
  defensePts: number;
  toolPts: number;
  quietPts: number;
  breachPenalty: number;
  total: number;
}

export interface ActiveDegradation {
  key: string;
  text: string;
  icon: string;
}

// ─── ENGINE ──────────────────────────────────────────────
export class GameEngine {
  products = new ProductPipeline();
  news = new NewsFeed();

  turn = 1;
  maxTurns = 8;
  phase: 'briefing' | 'budget' | 'report' | 'gameover' = 'briefing';

  revenue = 5000;
  companyValue = 250000;
  quarterlyBudget = 0;
  treasury = 0;
  reputation = 75;
  securityPosture = 0;
  knobs: SimKnobs = { ...DEFAULT_SIM_KNOBS };

  defenses: Record<string, number> = {};
  trainingPaid: Record<string, boolean> = {};

  pendingUpgrades: Record<string, number> = {};
  pendingMitigations: { productId: string; weaknessKey: string }[] = [];
  pendingTraining: Record<string, boolean> = {};

  // Tracking
  totalBreaches = 0;
  totalBlocked = 0;
  totalContained = 0;
  totalSpent = 0;
  totalAttackCost = 0;
  totalAttacks = 0;
  blindSpotBreaches = 0;
  blindSpotRepLost = 0;
  totalFalsePositiveCost = 0;
  totalDegradationEvents = 0;
  degradationBreaches = 0;
  deploymentTurns: Record<string, number> = {};
  quarterDegradations: ActiveDegradation[] = [];
  quietStreak = 0;
  quietBonus = 0;

  attackLog: { turn: number; name: string; severity: number; result: string; productsHit: number }[] = [];
  turnLog: { type: string; data: any }[] = [];
  fullLog: { turn: number; entries: any[] }[] = [];

  started = false;

  constructor() { this.reset(); }

  // Convert game turn to calendar quarter: Turn 1 = 2026 Q1, Turn 5 = 2027 Q1, etc.
  static START_YEAR = 2026;
  getCalendarQuarter(turn?: number): string {
    const t = turn ?? this.turn;
    const year = GameEngine.START_YEAR + Math.floor((t - 1) / 4);
    const q = ((t - 1) % 4) + 1;
    return `${year} Q${q}`;
  }

  reset(maxTurns?: number) {
    this.turn = 1; this.maxTurns = maxTurns ?? this.maxTurns ?? 8; this.phase = 'briefing';
    this.revenue = 5000; this.companyValue = 250000;
    this.quarterlyBudget = 0; this.treasury = this.knobs.startTreasury;
    this.reputation = this.knobs.startReputation; this.securityPosture = 0;
    this.defenses = {}; this.trainingPaid = {};
    for (const key of Object.keys(DEFENSES)) { this.defenses[key] = 0; this.trainingPaid[key] = false; }
    this.pendingUpgrades = {}; this.pendingMitigations = []; this.pendingTraining = {};
    this.totalBreaches = 0; this.totalBlocked = 0; this.totalContained = 0;
    this.totalSpent = 0; this.totalAttackCost = 0; this.totalAttacks = 0; this.attackLog = []; this.turnLog = []; this.fullLog = [];
    this.blindSpotBreaches = 0; this.blindSpotRepLost = 0;
    this.totalFalsePositiveCost = 0; this.totalDegradationEvents = 0;
    this.degradationBreaches = 0; this.deploymentTurns = {};
    this.quarterDegradations = [];
    this.quietStreak = 0; this.quietBonus = 0;
    this.started = false;
    this.products.reset(); this.news.reset();
    this.products.tick(1);
    this._calcBudget();
  }

  // ─── ALERT FATIGUE ─────────────────────────────────────
  getAlertLoad(): number {
    let load = 0;
    for (const [key, def] of Object.entries(DEFENSES)) {
      const lvl = (this.defenses[key] || 0) + (this.pendingUpgrades[key] || 0);
      load += lvl * def.alertLoad;
    }
    return load;
  }

  getStaffCapacity(): number {
    const staffLevel = this.getChampionCount();
    const agentLevel = this.getSupervisedAgentCount();
    const agentBonus = agentLevel * 4;
    return staffLevel * STAFF_CAPACITY_PER_LEVEL + agentBonus;
  }

  getAlertOverflow(): number {
    return Math.max(0, this.getAlertLoad() - this.getStaffCapacity());
  }

  getFalsePositiveCost(): number {
    return this.getAlertOverflow() * FALSE_POSITIVE_COST_PER_UNIT;
  }

  getAlertFatigueMultiplier(): number {
    const load = this.getAlertLoad();
    if (load === 0) return 1;
    const cap = this.getStaffCapacity();
    return Math.min(1, cap / load);
  }

  // ─── EFFECTIVE DEFENSE LEVEL ───────────────────────────
  // Combines: raw level, dependencies, degradation, alert fatigue, requirements quality
  getEffectiveDefenseLevel(key: string): number {
    // secTeam takes effect immediately (hired people start working)
    let level = key === 'secTeam'
      ? (this.defenses[key] || 0) + (this.pendingUpgrades[key] || 0)
      : (this.defenses[key] || 0);
    if (level === 0) return 0;

    // Dependency prerequisites — cap effective level if prereqs not met
    const dep = DEFENSE_DEPENDENCIES[key];
    if (dep?.requires) {
      for (const [reqKey, reqVal] of Object.entries(dep.requires)) {
        const reqLevel = this.defenses[reqKey] || 0;
        let needed: number;
        if (reqVal === 'level') needed = level;
        else if (reqVal === 'level+1') needed = level + 1;
        else needed = reqVal;
        if (reqLevel < needed) {
          // Cap to what the prereq can support
          const maxSupported = reqVal === 'level+1' ? Math.max(0, reqLevel - 1) : reqVal === 'level' ? reqLevel : (reqLevel >= needed ? level : Math.max(0, level - 1));
          level = Math.min(level, Math.max(1, maxSupported));
        }
      }
    }

    // Operational degradation: -1 if degraded this quarter
    if (this.quarterDegradations.some(d => d.key === key)) {
      level = Math.max(0, level - 1);
    }

    const def = DEFENSES[key];

    // Alert fatigue: only affects tools that generate alerts
    if (def && def.alertLoad > 0) {
      level = Math.max(0, Math.round(level * this.getAlertFatigueMultiplier()));
    }

    // Teams cannot fully leverage controls without threat modeling + security requirements.
    if (def && def.type === 'capability' && key !== 'secTeam') {
      const guidance = this.getGuidanceLevel();
      if (guidance <= 0) {
        level = Math.max(0, Math.round(level * 0.35));
      } else {
        const need = this.getAnticipatedNeed(key);
        if (need === 0 && key !== 'secAgents') {
          level = Math.max(0, Math.round(level * 0.2));
        } else {
          if (need > 0 && level > need) level = need;
          if (level > guidance) {
            level = guidance + Math.round((level - guidance) * 0.4);
          } else {
            level = Math.min(MAX_DEFENSE_LEVEL, level + 1);
          }
        }
      }
    }

    return level;
  }

  /** Weaker of TM and requirements, capped at company size. 0 = tools sit unused. */
  getGuidanceLevel(): number {
    const both = Math.min(this.threatModelLevel, this.reqMgmtLevel);
    if (both <= 0) return 0;
    return Math.min(both, this.getProgramTarget());
  }

  /** How strong this control needs to be for the attacks on live systems. Extra levels past this do not help. */
  getAnticipatedNeed(key: string): number {
    if (key === 'threatModel' || key === 'reqMgmt') return this.getProgramTarget();
    if (this.threatModelLevel === 0) return 0;
    let need = 0;
    for (const p of this.products.active) {
      for (const wk of p.weaknesses) {
        if (p.mitigated.has(wk)) continue;
        const w = WEAKNESSES[wk];
        if (!w?.mitigations?.length) continue;
        const path = w.mitigations.find(m => m.effectiveness >= 0.5) || w.mitigations[0];
        if (path && key in path.requires) {
          need = Math.max(need, path.requires[key]);
        }
      }
    }
    return need;
  }

  // Check if deploying a defense creates risk due to missing prereqs
  getDeploymentRisks(): { key: string; desc: string; weakness: string }[] {
    const risks: { key: string; desc: string; weakness: string }[] = [];
    for (const [key, dep] of Object.entries(DEFENSE_DEPENDENCIES)) {
      if ((this.defenses[key] || 0) === 0) continue;
      if (!dep.riskIf) continue;
      const missingLevel = this.defenses[dep.riskIf.missing] || 0;
      const needed = dep.requires?.[dep.riskIf.missing];
      let requiredLevel: number;
      if (needed === 'level+1') requiredLevel = (this.defenses[key] || 0) + 1;
      else if (needed === 'level') requiredLevel = this.defenses[key] || 0;
      else requiredLevel = typeof needed === 'number' ? needed : dep.riskIf.minLevel;
      if (missingLevel < requiredLevel) {
        risks.push({ key, desc: dep.riskIf.desc, weakness: dep.riskIf.weakness });
      }
    }
    return risks;
  }

  // ─── VISIBILITY ────────────────────────────────────────
  get threatModelLevel() { return this.defenses.threatModel || 0; }
  get reqMgmtLevel() { return this.defenses.reqMgmt || 0; }

  // Visibility rate varies by threat category.
  // OWASP (traditional web) threats are well-understood — easier to identify at lower TM levels.
  // AI/LLM threats are newer — need higher TM investment to identify.
  /** TM/RM above program size does not reveal more or execute better. */
  getUsefulTmLevel(): number {
    if (this.threatModelLevel <= 0) return 0;
    return Math.min(this.threatModelLevel, this.getProgramTarget());
  }

  getUsefulRmLevel(): number {
    if (this.reqMgmtLevel <= 0) return 0;
    return Math.min(this.reqMgmtLevel, this.getProgramTarget());
  }

  getVisibilityRateForCategory(category: 'OWASP' | 'AI/LLM'): number {
    const level = this.getUsefulTmLevel();
    if (level === 0) return 0;
    const systemCount = Math.max(1, this.products.active.length);
    const capacityRatio = Math.min(1, (level * 4) / systemCount);
    const base = category === 'OWASP'
      ? Math.min(0.5 + level * 0.15, 1.0)
      : Math.min(0.3 + level * 0.15, 1.0);

    const trainedRate = base;
    return trainedRate * capacityRatio;
  }

  // Overall visibility (backward compat) — uses average
  getVisibilityRate(): number {
    return this.getVisibilityRateForCategory('OWASP');
  }

  // Each RM level can fully cover ~2 systems.
  getRequirementCoverage(): number {
    const level = this.getUsefulRmLevel();
    if (level === 0) return 0;
    const systemCount = Math.max(1, this.products.active.length);
    const capacityRatio = Math.min(1, (level * 4) / systemCount);
    const base = Math.min(0.3 + level * 0.17, 1.0);
    const trainedRate = base;
    return trainedRate * capacityRatio;
  }

  // How many systems the current TM level can fully cover
  getThreatModelCapacity(): number { return this.getUsefulTmLevel() * 4; }
  getReqMgmtCapacity(): number { return this.getUsefulRmLevel() * 4; }

  getIndustryEstimate(product: Product): { level: 'Low' | 'Medium' | 'High' | 'Critical'; count: number } {
    const n = product.weaknesses.length;
    if (n >= 5) return { level: 'Critical', count: n };
    if (n >= 4) return { level: 'High', count: n };
    if (n >= 3) return { level: 'Medium', count: n };
    return { level: 'Low', count: n };
  }

  getVisibleWeaknesses(product: Product): string[] {
    const tm = this.getUsefulTmLevel();
    if (tm === 0) return [];
    const idx = this.products.active.findIndex(p => p.id === product.id);
    if (idx < 0 || idx >= this.getThreatModelCapacity()) return [];
    return product.weaknesses.filter(wk => {
      const category = WEAKNESSES[wk]?.category || 'OWASP';
      if (category === 'OWASP') return tm >= 1;
      return tm >= 2;
    });
  }

  getHiddenWeaknessCount(product: Product): number {
    return product.weaknesses.length - this.getVisibleWeaknesses(product).length;
  }

  getVisibleRequirements(weaknessKey: string): typeof REQUIREMENTS[string] {
    const reqs = REQUIREMENTS[weaknessKey] || [];
    const rate = this.getRequirementCoverage();
    if (rate >= 1) return reqs;
    if (rate === 0) return [];
    return reqs.filter((_, i) => {
      const hash = (weaknessKey.charCodeAt(0) * 31 + i * 17) % 100;
      return hash < rate * 100;
    });
  }

  // ─── BUDGET ────────────────────────────────────────────
  _calcBudget() {
    // Security budget ~4–8% of quarterly revenue (not 15%+). Forces TM vs staff vs tools.
    const pct = 0.04 + (this.reputation / 2000);
    this.quarterlyBudget = Math.round((this.revenue + this.products.getTotalRevenue()) * pct);
  }

  getRunCostBreakdown(includePending = false): {
    upkeep: number; training: number; falsePositives: number; total: number;
  } {
    this._enforceLevelCaps();
    const tm = (this.defenses.threatModel || 0) + (includePending ? (this.pendingUpgrades.threatModel || 0) : 0);
    const rm = (this.defenses.reqMgmt || 0) + (includePending ? (this.pendingUpgrades.reqMgmt || 0) : 0);
    const aligned = Math.min(tm, rm);
    let upkeep = 0;
    for (const [key, def] of Object.entries(DEFENSES)) {
      const level = (this.defenses[key] || 0) + (includePending ? (this.pendingUpgrades[key] || 0) : 0);
      if (level <= 0) continue;
      let unit = def.maintainCost;
      if (def.type === 'capability' && aligned > 0 && aligned >= level) {
        unit = Math.round(unit * GUIDED_UPKEEP_MUL);
      }
      upkeep += level * unit;
    }
    let training = 0;
    for (const [key, def] of Object.entries(DEFENSES)) {
      if (def.trainingCost > 0 && this.pendingTraining[key] && ((this.defenses[key] || 0) > 0 || this.pendingUpgrades[key])) {
        training += def.trainingCost;
      }
    }
    const falsePositives = this.getFalsePositiveCost();
    return { upkeep, training, falsePositives, total: upkeep + training + falsePositives };
  }

  getMaintenanceCost(): number {
    return this.getRunCostBreakdown(false).total;
  }

  getAvailableBudget(): number {
    return this.quarterlyBudget + this.treasury
      - this.getMaintenanceCost()
      - this._pendingUpgradeCost();
  }

  _pendingUpgradeCost(): number {
    let cost = 0;
    for (const [key, levels] of Object.entries(this.pendingUpgrades)) {
      const owned = this.defenses[key] || 0;
      for (let i = 0; i < levels; i++) cost += this.setupCostAt(key, owned + i);
    }
    return cost;
  }

  /** Cost to buy the next level when you already have `have` levels. */
  setupCostAt(key: string, have: number): number {
    const full = DEFENSES[key].setupCost;
    if (DEFENSES[key].type === 'tool' && have > 0) return Math.max(10, Math.round(full * 0.35));
    return full;
  }

  getPendingSetupCost(key: string): number {
    const owned = this.defenses[key] || 0;
    const n = this.pendingUpgrades[key] || 0;
    let cost = 0;
    for (let i = 0; i < n; i++) cost += this.setupCostAt(key, owned + i);
    return cost;
  }

  getChampionCount(): number {
    return (this.defenses.secTeam || 0) + (this.pendingUpgrades.secTeam || 0);
  }

  /** Agents only count when staff is at a higher level. */
  getSupervisedAgentCount(): number {
    const raw = (this.defenses.secAgents || 0) + (this.pendingUpgrades.secAgents || 0);
    return Math.min(raw, Math.max(0, this.getChampionCount() - 1));
  }

  getTeamMemberCount(): number {
    return this.getChampionCount() * TEAM_MEMBERS_PER_CHAMPION
      + this.getSupervisedAgentCount() * AGENT_TEAM_MEMBERS_PER_LEVEL;
  }

  getMitigationHours(weaknessKey: string): number {
    return (REQUIREMENTS[weaknessKey] || []).reduce((s, r) => s + r.effort, 0);
  }

  getHourCapacity(): number {
    return this.getTeamMemberCount() * HOURS_PER_TEAM_MEMBER;
  }

  getHoursQueued(): number {
    return this.pendingMitigations.reduce((s, m) => s + this.getMitigationHours(m.weaknessKey), 0);
  }

  getHoursRemaining(): number {
    return Math.max(0, this.getHourCapacity() - this.getHoursQueued());
  }

  getMitigationCost(weaknessKey: string): number {
    return this.getMitigationHours(weaknessKey);
  }

  getMitigationCapacity(): number {
    return this.getHourCapacity();
  }

  getMitigationsQueued(): number {
    return this.pendingMitigations.length;
  }

  getMitigationSlotsRemaining(): number {
    return this.getHoursRemaining();
  }

  // ─── ACTIONS ───────────────────────────────────────────
  getLevelCap(key: string): number {
    if (key === 'secAgents') {
      return Math.max(0, Math.min(MAX_DEFENSE_LEVEL, this.getChampionCount() - 1));
    }
    return MAX_DEFENSE_LEVEL;
  }

  _enforceLevelCaps() {
    for (const key of Object.keys(this.pendingUpgrades)) {
      const owned = this.defenses[key] || 0;
      const maxPending = Math.max(0, this.getLevelCap(key) - owned);
      if ((this.pendingUpgrades[key] || 0) > maxPending) {
        if (maxPending === 0) delete this.pendingUpgrades[key];
        else this.pendingUpgrades[key] = maxPending;
      }
    }
  }

  getUpgradeCost(key: string): number | null {
    this._enforceLevelCaps();
    const eff = (this.defenses[key] || 0) + (this.pendingUpgrades[key] || 0);
    if (eff >= this.getLevelCap(key)) return null;
    return this.setupCostAt(key, eff);
  }

  queueUpgrade(key: string): boolean {
    const cost = this.getUpgradeCost(key);
    if (cost === null || cost > this.getAvailableBudget()) return false;
    this.pendingUpgrades[key] = (this.pendingUpgrades[key] || 0) + 1;
    return true;
  }

  cancelUpgrade(key: string): boolean {
    if (!this.pendingUpgrades[key]) return false;
    this.pendingUpgrades[key]--;
    if (!this.pendingUpgrades[key]) delete this.pendingUpgrades[key];
    return true;
  }

  toggleTraining(key: string): boolean {
    const def = DEFENSES[key];
    if (!def || def.trainingCost === 0) return false;
    if (this.defenses[key] === 0 && !this.pendingUpgrades[key]) return false;
    this.pendingTraining[key] = !this.pendingTraining[key];
    if (this.getAvailableBudget() < 0) { this.pendingTraining[key] = false; return false; }
    return true;
  }

  queueMitigation(productId: string, weaknessKey: string): boolean {
    const product = this.products.active.find(p => p.id === productId);
    if (!product || product.mitigated.has(weaknessKey)) return false;
    if (this.pendingMitigations.find(m => m.productId === productId && m.weaknessKey === weaknessKey)) return false;
    if (this.getMitigationHours(weaknessKey) > this.getHoursRemaining()) return false;
    this.pendingMitigations.push({ productId, weaknessKey });
    return true;
  }

  cancelMitigation(productId: string, weaknessKey: string): boolean {
    const idx = this.pendingMitigations.findIndex(m => m.productId === productId && m.weaknessKey === weaknessKey);
    if (idx === -1) return false;
    this.pendingMitigations.splice(idx, 1);
    return true;
  }

  isMitigationQueued(productId: string, weaknessKey: string): boolean {
    return !!this.pendingMitigations.find(m => m.productId === productId && m.weaknessKey === weaknessKey);
  }

  // ─── END QUARTER ───────────────────────────────────────
  endQuarter() {
    if (this.phase !== 'budget') return null;
    this.phase = 'report' as const;
    this.turnLog = [];
    this.quarterDegradations = [];

    // Apply upgrades & track deployment turns
    for (const [key, levels] of Object.entries(this.pendingUpgrades)) {
      const wasBefore = this.defenses[key] || 0;
      this.defenses[key] = wasBefore + levels;
      if (wasBefore === 0 && this.defenses[key] > 0 && !this.deploymentTurns[key]) {
        this.deploymentTurns[key] = this.turn;
      }
    }

    // Apply training
    for (const key of Object.keys(DEFENSES)) {
      this.trainingPaid[key] = !!this.pendingTraining[key];
    }

    // Apply mitigations
    for (const m of this.pendingMitigations) {
      const product = this.products.active.find(p => p.id === m.productId);
      if (product) product.mitigated.add(m.weaknessKey);
    }

    const fpCost = this.getFalsePositiveCost();
    this.totalFalsePositiveCost += fpCost;

    const spent = this.getMaintenanceCost() + this._pendingUpgradeCost();
    this.treasury = this.getAvailableBudget();
    this.totalSpent += spent;
    this.pendingUpgrades = {};
    this.pendingMitigations = [];
    this.pendingTraining = {};

    this._calcPosture();

    // Operational degradation rolls
    this._rollDegradation();

    // Attacks hit the production estate you had this quarter, not systems that just arrived.
    for (const a of this._rollAttacks()) this.turnLog.push({ type: 'attack', data: a });

    const newsItems = this.news.rollNews(this.turn);
    const newsResults = this.news.applyEffects(newsItems, this);
    for (let i = 0; i < newsItems.length; i++) {
      this.turnLog.push({ type: 'news', data: { ...newsItems[i], impact: newsResults[i]?.impact } });
    }

    this.turnLog.push({ type: 'event', data: this._rollEvent() });

    for (const pe of this.products.tick(this.turn + 1)) {
      this.turnLog.push({ type: pe.type, data: pe.product });
    }

    this._applyGrowth();

    const milestone = MILESTONES.find(m => m.turn === this.turn);
    if (milestone) {
      this.companyValue = Math.round(this.companyValue * (1 + milestone.valuationBoost / 100));
      this.turnLog.push({ type: 'milestone', data: milestone });
    }

    this._calcBudget();
    this.fullLog.push({ turn: this.turn, entries: [...this.turnLog] });
    this.phase = 'report';
    return this.turnLog;
  }

  nextTurn() {
    if (this.phase !== 'report') return;
    if (this.reputation <= 0 || this.turn >= this.maxTurns) {
      this.phase = 'gameover';
      return;
    }
    this.turn++;
    this.phase = 'budget';
  }

  getWinLabel(): string {
    return this.maxTurns >= 20 ? 'IPO' : 'Series B';
  }

  getDebrief(): string {
    const tm = this.threatModelLevel;
    const rm = this.reqMgmtLevel;
    const survived = this.reputation > 0 && this.turn >= this.maxTurns;
    if (!tm && !rm) {
      return survived
        ? 'Luck carried you. Controls without anticipation and execution usually do not hold.'
        : 'The job is anticipate the attack, fund it, and execute. You spent without a picture of what was coming.';
    }
    if (survived && tm && rm) {
      return 'You anticipated the surface, funded the matching controls, and executed them. Luck still rolled. It just had less room.';
    }
    if (!survived) {
      return 'Prediction, execution, and luck. Something lagged: unseen risk, a control that was not applied well, or a bad quarter.';
    }
    return 'You lasted. Keep anticipation and execution in step with growth. More revenue draws more attacks.';
  }

  // ─── DEGRADATION ───────────────────────────────────────
  _rollDegradation() {
    const staffLevel = this.defenses.secTeam || 0;
    const agentLevel = this.defenses.secAgents || 0;
    // Staff reduces degradation probability; agents reduce it further (automated monitoring catches issues)
    const agentReduction = staffLevel >= 1 ? agentLevel * 0.008 : 0;
    const prob = Math.max(0.005, DEGRADATION_BASE_PROB - staffLevel * DEGRADATION_STAFF_REDUCTION - agentReduction);
    let count = 0;

    const deployed = Object.entries(this.defenses).filter(([, lvl]) => lvl > 0);
    const shuffled = deployed.sort(() => Math.random() - 0.5);

    const aligned = Math.min(this.threatModelLevel, this.reqMgmtLevel);
    for (const [key] of shuffled) {
      if (count >= DEGRADATION_MAX_PER_QUARTER) break;
      if (key === 'secTeam') continue;
      if (this.turn <= 1) continue; // grace first quarter
      if (this.deploymentTurns[key] === this.turn) continue; // don't break a tool the quarter you buy it
      const lvl = this.defenses[key] || 0;
      if (aligned > 0 && aligned >= lvl) continue; // TM + requirements at this level keep the control steady
      if (Math.random() < prob) {
        const evt = DEGRADATION_EVENTS.find(e => e.targets === key);
        if (evt) {
          this.quarterDegradations.push({ key, text: evt.text, icon: evt.icon });
          this.turnLog.push({ type: 'degradation', data: { key, text: evt.text, icon: evt.icon, defense: DEFENSES[key].name } });
          this.totalDegradationEvents++;
          count++;
        }
      }
    }
  }

  // ─── ATTACKS ───────────────────────────────────────────
  // Mitigation effectiveness for a weakness.
  // If threat modeling hasn't identified this weakness on a specific product,
  // defenses provide only generic (half) protection — they aren't targeted.
  getMitigationEffectiveness(weaknessKey: string, product?: Product): number {
    const w = WEAKNESSES[weaknessKey];
    if (!w?.mitigations) return 0;
    let best = 0;
    for (const path of w.mitigations) {
      const met = Object.entries(path.requires).every(
        ([defKey, minLevel]) => this.getEffectiveDefenseLevel(defKey) >= minLevel
      );
      if (met && path.effectiveness > best) best = path.effectiveness;
    }

    // Threat modeling targeting: if this weakness isn't visible on the product,
    // defenses are generic (half effectiveness) — not configured for this specific risk
    if (product && best > 0) {
      const visible = this.getVisibleWeaknesses(product);
      if (!visible.includes(weaknessKey)) {
        best *= 0.5;
      }
    }

    const program = this.getProgramTarget();
    if (best > 0 && this.threatModelLevel >= program && this.reqMgmtLevel >= program) {
      best = Math.min(1, best + 0.15);
    }

    return best;
  }

  getBestMatchedPath(weaknessKey: string): { effectiveness: number; hint: string; met: boolean; requires: Record<string, number> } | null {
    const w = WEAKNESSES[weaknessKey];
    if (!w?.mitigations) return null;
    let bestMet: any = null;
    let bestNext: any = null;
    for (const path of w.mitigations) {
      const met = Object.entries(path.requires).every(
        ([defKey, minLevel]) => this.getEffectiveDefenseLevel(defKey) >= minLevel
      );
      if (met) { if (!bestMet || path.effectiveness > bestMet.effectiveness) bestMet = { ...path, met: true }; }
      else { if (!bestNext || path.effectiveness > bestNext.effectiveness) bestNext = { ...path, met: false }; }
    }
    return bestMet || bestNext || null;
  }

  getCompanyRevenue(): number {
    return this.revenue + this.products.getTotalRevenue();
  }

  /** Bigger revenue → more attackers notice you. ~1.0 at $5M/q. */
  getAttackPressure(): number {
    return Math.min(2.8, Math.max(0.7, this.getCompanyRevenue() / 5000));
  }

  /** TM + requirements sized to systems. AI products need at least L2. */
  getProgramTarget(): number {
    const systems = Math.max(1, this.products.active.length);
    let t = Math.min(MAX_DEFENSE_LEVEL, Math.max(1, Math.ceil(systems / 4)));
    const hasAi = this.products.active.some(p =>
      p.weaknesses.some(wk => WEAKNESSES[wk]?.category === 'AI/LLM'),
    );
    if (hasAi) t = Math.max(2, t);
    return t;
  }

  hasAppliedGuidance(): boolean {
    if (this.getGuidanceLevel() <= 0) return false;
    return Object.entries(this.defenses).some(([k, lvl]) =>
      lvl > 0 && DEFENSES[k]?.type === 'capability' && k !== 'secTeam' && k !== 'secAgents',
    );
  }
  getGuidedSurfaceMul(): number {
    if (!this.hasAppliedGuidance()) return 1;
    const g = this.getGuidanceLevel();
    const p = Math.max(1, this.getProgramTarget());
    let mul = Math.max(SDL_ATTACK_REMAINING, 1 - (1 - SDL_ATTACK_REMAINING) * (g / p));
    mul = Math.min(1, mul + this.getGoldPlateSurfacePenalty());
    const overflow = this.getAlertOverflow();
    if (overflow > 0) mul = Math.min(1, mul + Math.min(0.35, overflow * 0.02));
    return mul;
  }

  /** Extra control levels past anticipated need expand the live surface (misconfig, unused product). */
  getGoldPlateSurfacePenalty(): number {
    if (this.threatModelLevel <= 0) return 0;
    let extra = 0;
    for (const [k, def] of Object.entries(DEFENSES)) {
      if (def.type !== 'capability' || k === 'secTeam' || k === 'secAgents') continue;
      const have = this.defenses[k] || 0;
      const need = this.getAnticipatedNeed(k);
      extra += Math.max(0, have - Math.max(need, 0));
    }
    return Math.min(0.45, extra * 0.03);
  }

  _rollAttacks() {
    const results: any[] = [];
    const pressure = this.getAttackPressure();
    const surface = this.getGuidedSurfaceMul();
    const rawMax = 0.7 * pressure + this.turn / 12;
    const max = Math.min(3, Math.max(0, Math.round(rawMax * surface)));
    if (max === 0) return results;

    const live = this.products.getLiveProducts();
    if (live.length === 0) return results;
    const liveWeaknesses = new Set<string>();
    for (const p of live) {
      for (const wk of p.weaknesses) liveWeaknesses.add(wk);
    }
    const relevantAttacks = ATTACKS.filter(a => a.exploits.some(wk => liveWeaknesses.has(wk)));
    const shuffled = relevantAttacks.sort(() => Math.random() - 0.5);
    const visRate = this.getVisibilityRate();

    // Attack pressure ramps with time and revenue; guidance shrinks the live surface.
    const rampFactor = Math.min(1.1, 0.25 + (this.turn - 1) * 0.05) * Math.min(1.6, pressure) * this.knobs.attackRampMul * surface;

    for (const tpl of shuffled) {
      if (results.length >= max) break;
      if (Math.random() > tpl.quarterlyProb * rampFactor) continue;

      const attack: any = {
        ...tpl, vulnProducts: [], result: 'blocked', impact: '',
        reason: '', blindSpot: false, degraded: false, alertFatigue: false,
        educationalStat: `${tpl.annualRate} (${tpl.source})`,
        sourceUrl: urlForCitation(tpl.citation, tpl.source),
      };

      // Check which weaknesses are exploitable given current defenses
      const exploitedWeaknesses: string[] = [];
      for (const wk of tpl.exploits) {
        // Check per-product: is this weakness mitigated on all products?
        const vulnerableProducts = this.products.getVulnerableTo(wk);
        let anyVulnerable = false;
        for (const p of vulnerableProducts) {
          const effectiveness = this.getMitigationEffectiveness(wk, p);
          if (effectiveness >= 0.9) continue;
          anyVulnerable = true;
          if (!attack.vulnProducts.find((v: any) => v.id === p.id)) {
            const isHidden = visRate < 1 && !this.getVisibleWeaknesses(p).includes(wk);
            attack.vulnProducts.push({ id: p.id, name: p.name, weakness: wk, hidden: isHidden });
          }
        }
        if (anyVulnerable) exploitedWeaknesses.push(wk);
      }

      // Overall effectiveness = best mitigation across products for each exploited weakness
      let overallEffectiveness = 0;
      for (const wk of tpl.exploits) {
        for (const p of this.products.getLiveProducts()) {
          const eff = this.getMitigationEffectiveness(wk, p);
          if (eff > overallEffectiveness) overallEffectiveness = eff;
        }
      }

      // Check if alert fatigue or degradation contributed
      const fatigueMultiplier = this.getAlertFatigueMultiplier();
      const hasDegradedDefense = tpl.exploits.some((wk: string) => {
        const w = WEAKNESSES[wk];
        if (!w?.mitigations) return false;
        return w.mitigations.some(path =>
          Object.keys(path.requires).some(dk => this.quarterDegradations.some(d => d.key === dk))
        );
      });

      const mistakeRoll = Math.random();
      const anyBlindSpot = attack.vulnProducts.some((v: any) => v.hidden);

      if (attack.vulnProducts.length === 0) {
        attack.result = 'blocked';
        attack.impact = 'All systems secured.';
        // Build reason citing which defenses helped
        const helpingDefenses = this._getHelpingDefenses(tpl.exploits);
        attack.reason = helpingDefenses.length > 0
          ? `Your ${helpingDefenses.join(' and ')} stopped this.`
          : 'No vulnerable products exposed.';
        this.totalBlocked++;
        attack.lossK = this._chargeAttackLoss(tpl, 'blocked', overallEffectiveness);
      } else if (overallEffectiveness >= 0.5 && mistakeRoll > 0.05) {
        attack.result = 'contained';
        const names = attack.vulnProducts.map((v: any) => v.name).join(', ');
        attack.impact = `Contained. ${names} exposed but limited.`;
        const helpingDefenses = this._getHelpingDefenses(tpl.exploits);
        attack.reason = `Your ${helpingDefenses.join(' and ')} limited the damage.`;
        this.reputation = Math.max(0, this.reputation - 1);
        this.companyValue = Math.round(this.companyValue * 0.99);
        this.totalContained++;
        attack.lossK = this._chargeAttackLoss(tpl, 'contained', overallEffectiveness);
      } else {
        attack.result = 'breach';
        const reduction = overallEffectiveness * 0.5;
        const repHit = Math.max(2, Math.round((2 + tpl.severity + attack.vulnProducts.length) * (1 - reduction) * this.knobs.breachRepScale));
        const names = attack.vulnProducts.map((v: any) => v.name).join(', ');
        attack.impact = `BREACH — ${names} compromised. Rep -${repHit}`;

        // Determine breach cause for educational reasoning
        if (anyBlindSpot) {
          attack.blindSpot = true;
          if (this.threatModelLevel === 0) {
            attack.reason = 'This was not anticipated on that system, so the spend did not line up.';
          } else {
            attack.reason = 'You could see a gap, but anticipation did not yet cover this one. Widen what you look at, or fund the matching control.';
          }
          this.blindSpotBreaches++;
          this.blindSpotRepLost += repHit;
        } else if (fatigueMultiplier < 1 && tpl.exploits.some((wk: string) => {
          const w = WEAKNESSES[wk];
          return w?.mitigations?.some(p => Object.keys(p.requires).some(dk => DEFENSES[dk]?.alertLoad > 0));
        })) {
          attack.alertFatigue = true;
          attack.reason = 'Your tools flagged this but the alert was lost in noise. More Security Staff would help.';
        } else if (hasDegradedDefense) {
          attack.degraded = true;
          const deg = this.quarterDegradations[0];
          attack.reason = `This slipped through because your ${DEFENSES[deg?.key]?.name || 'defenses'} was degraded this quarter.`;
          this.degradationBreaches++;
        } else {
          // Known gap — find the unmitigated weakness
          const unmitigated = exploitedWeaknesses.find(wk => this.getMitigationEffectiveness(wk) < 0.5);
          const w = unmitigated ? WEAKNESSES[unmitigated] : null;
          attack.reason = w
            ? `Anticipated a ${w.label} gap — the matching investment or execution was not enough (luck can still bite).`
            : 'This attack found a gap in funding or execution.';
        }

        if (mistakeRoll <= 0.05 && overallEffectiveness >= 0.5) {
          attack.reason += ' (operational error despite defenses)';
        }

        this.reputation = Math.max(0, this.reputation - repHit);
        this.companyValue = Math.round(this.companyValue * (1 - (0.02 + tpl.severity * 0.01) * (1 - reduction)));
        this.totalBreaches++;
        attack.lossK = this._chargeAttackLoss(tpl, 'breach', overallEffectiveness);
      }

      this.attackLog.push({ turn: this.turn, name: attack.name, severity: attack.severity, result: attack.result, productsHit: attack.vulnProducts.length, lossK: attack.lossK || 0 });
      this.totalAttacks++;
      results.push(attack);
    }
    return results;
  }

  /** Industry-cited incident $K. Blocked = 0, contained = IR slice, breach = cited cost minus how much you contained. */
  _chargeAttackLoss(tpl: { costEstimate: string }, result: 'blocked' | 'contained' | 'breach', effectiveness: number): number {
    const full = industryLossK(tpl.costEstimate);
    let loss = 0;
    if (result === 'contained') loss = Math.round(full * 0.12);
    else if (result === 'breach') loss = Math.round(full * (1 - effectiveness * 0.5));
    if (loss > 0 && this.hasAppliedGuidance()) loss = Math.round(loss * GUIDED_BREACH_LOSS_MUL);
    this.totalAttackCost += loss;
    return loss;
  }

  _getHelpingDefenses(exploits: string[]): string[] {
    const helpers = new Set<string>();
    for (const wk of exploits) {
      const w = WEAKNESSES[wk];
      if (!w?.mitigations) continue;
      for (const path of w.mitigations) {
        const met = Object.entries(path.requires).every(
          ([dk, min]) => this.getEffectiveDefenseLevel(dk) >= min
        );
        if (met) {
          for (const dk of Object.keys(path.requires)) {
            helpers.add(DEFENSES[dk]?.name || dk);
          }
        }
      }
    }
    return [...helpers].slice(0, 2);
  }

  // ─── ADVISOR ───────────────────────────────────────────
  // Intelligence quality scales with tool deployment:
  //   No tools    -> vague, generic guidance ("consider investing in security")
  //   Threat model -> identifies WHICH defenses are insufficient per weakness
  //   Req mgmt    -> shows OPTIMAL investment path with cost/benefit and ROI ranking
  //   Both        -> full strategic picture with prioritized, costed action plan

  getAdvisorLevel(): 'blind' | 'aware' | 'guided' | 'strategic' {
    const tm = this.threatModelLevel > 0;
    const rm = this.reqMgmtLevel > 0;
    if (tm && rm) return 'strategic';
    if (tm) return 'aware';
    if (rm) return 'guided'; // unlikely path — req mgmt without threat modeling
    return 'blind';
  }

  getRecommendations(): Recommendation[] {
    const recs: Recommendation[] = [];
    const alreadyQueued = new Set(Object.keys(this.pendingUpgrades));
    const program = this.getProgramTarget();

    if (this.threatModelLevel < program && !alreadyQueued.has('threatModel')) {
      recs.push({
        icon: '🔍',
        title: this.products.active.length === 1 ? 'Assess this system' : 'Assess these systems',
        detail: this.threatModelLevel === 0
          ? 'Find which systems are vulnerable and how likely attacks are.'
          : 'New products arrived. Widen the assessment so they are in scope.',
        actionType: 'upgrade', actionKey: 'threatModel', cost: DEFENSES.threatModel.setupCost,
      });
    }

    const overflow = this.getAlertOverflow();
    if (overflow > 0 && recs.length < 3 && !alreadyQueued.has('secTeam')) {
      recs.push({
        icon: '👥', title: 'Hire a champion and a team of 4',
        detail: 'One person who can use the tools, plus teammates who do the hours. Tools send alerts. You need people to read them and to land the fixes.',
        actionType: 'upgrade', actionKey: 'secTeam', cost: DEFENSES.secTeam.setupCost,
      });
    }

    const gaps = this._findInsufficientDefenses();
    const liveGaps = gaps.filter(g => g.liveNames.length > 0);
    const laterGaps = gaps.filter(g => g.liveNames.length === 0 && g.laterNames.length > 0);
    for (const item of [...liveGaps, ...laterGaps]) {
      if (recs.length >= 3) break;
      if (alreadyQueued.has(item.key)) continue;
      const live = item.liveNames.length > 0;
      recs.push({
        icon: item.def.icon,
        title: `Buy ${item.def.name}`,
        detail: live
          ? `Live now. ${item.liveNames.join(', ')}.`
          : `Not live yet. ${item.laterNames.join(', ')} needs this before it ships.`,
        actionType: 'upgrade', actionKey: item.key, cost: item.def.setupCost,
      });
    }

    if (gaps.length === 0 && recs.length < 3) {
      const guess = this._guessFromIndustry();
      for (const item of guess) {
        if (recs.length >= 3) break;
        if (alreadyQueued.has(item.actionKey!)) continue;
        recs.push(item);
      }
    }

    if (recs.length < 3 && this.threatModelLevel > 0 && this.reqMgmtLevel < this.threatModelLevel && !alreadyQueued.has('reqMgmt')) {
      recs.push({
        icon: '📝', title: 'Write how the team should use the tools',
        detail: 'Tell the team where and how to apply each tool.',
        actionType: 'upgrade', actionKey: 'reqMgmt', cost: DEFENSES.reqMgmt.setupCost,
      });
    }

    return recs.slice(0, 3);
  }

  _guessFromIndustry(): Recommendation[] {
    const active = new Set<string>();
    for (const p of this.products.getLiveProducts()) for (const wk of p.weaknesses) active.add(wk);
    const recs: Recommendation[] = [];
    const seen = new Set<string>();
    for (const a of [...ATTACKS].sort((x, y) => y.quarterlyProb - x.quarterlyProb)) {
      if (!a.exploits.some(wk => active.has(wk))) continue;
      for (const wk of a.exploits) {
        const w = WEAKNESSES[wk];
        const dk = w?.mitigations?.[0] ? Object.keys(w.mitigations[0].requires)[0] : null;
        if (!dk || seen.has(dk) || dk === 'threatModel' || dk === 'reqMgmt') continue;
        if ((this.defenses[dk] || 0) + (this.pendingUpgrades[dk] || 0) >= 2) continue;
        seen.add(dk);
        recs.push({
          icon: DEFENSES[dk].icon,
          title: `Buy ${DEFENSES[dk].name}`,
          detail: `Usual control for ${a.name.toLowerCase()} (${a.annualRate}).`,
          actionType: 'upgrade', actionKey: dk, cost: DEFENSES[dk].setupCost,
          sourceLabel: a.source,
          sourceUrl: urlForCitation(a.citation, a.source),
        });
        if (recs.length >= 2) return recs;
      }
    }
    return recs;
  }

  // Threat modeling insight: which defenses are insufficient for visible weaknesses
  _findInsufficientDefenses(): { key: string; def: typeof DEFENSES[string]; currentLevel: number; requiredLevel: number; liveNames: string[]; laterNames: string[] }[] {
    const gaps: Record<string, { key: string; def: typeof DEFENSES[string]; currentLevel: number; requiredLevel: number; liveNames: string[]; laterNames: string[] }> = {};
    for (const p of this.products.active) {
      for (const wk of this.getVisibleWeaknesses(p)) {
        if (p.mitigated.has(wk)) continue;
        const w = WEAKNESSES[wk];
        if (!w?.mitigations) continue;
        for (const path of w.mitigations) {
          for (const [dk, minLevel] of Object.entries(path.requires)) {
            const current = this.getEffectiveDefenseLevel(dk);
            if (current < minLevel) {
              if (!gaps[dk]) gaps[dk] = { key: dk, def: DEFENSES[dk], currentLevel: current, requiredLevel: minLevel, liveNames: [], laterNames: [] };
              const bucket = p.launched ? gaps[dk].liveNames : gaps[dk].laterNames;
              if (!bucket.includes(p.name)) bucket.push(p.name);
              if (minLevel > gaps[dk].requiredLevel) gaps[dk].requiredLevel = minLevel;
            }
          }
        }
      }
    }
    return Object.values(gaps).sort((a, b) => b.liveNames.length - a.liveNames.length || b.laterNames.length - a.laterNames.length);
  }

  // Target investment levels based on actual product weaknesses + mitigation paths
  // Only accurate when threat modeling is active (otherwise you're guessing)
  getTargetLevels(): Record<string, { target: number; current: number; status: 'under' | 'optimal' | 'over' }> {
    const program = this.getProgramTarget();
    const result: Record<string, { target: number; current: number; status: 'under' | 'optimal' | 'over' }> = {};
    for (const [dk] of Object.entries(DEFENSES)) {
      if (dk === 'secTeam') continue;
      const current = this.defenses[dk] || 0;
      const target = this.getAnticipatedNeed(dk) || (dk === 'threatModel' || dk === 'reqMgmt' ? program : 0);
      const knowNeed = this.threatModelLevel > 0 || dk === 'threatModel' || dk === 'reqMgmt';
      result[dk] = {
        target,
        current,
        status: !knowNeed ? 'optimal' : current < target ? 'under' : current > target + 1 ? 'over' : 'optimal',
      };
    }
    return result;
  }

  // Find defenses where the player has over-invested relative to their actual needs
  getOverInvestments(): { key: string; name: string; current: number; needed: number }[] {
    if (this.threatModelLevel === 0) return []; // can't tell without visibility
    const targets = this.getTargetLevels();
    return Object.entries(targets)
      .filter(([, v]) => v.status === 'over')
      .map(([key, v]) => ({ key, name: DEFENSES[key].name, current: v.current, needed: v.target }));
  }

  // Requirements mgmt insight: ROI-ranked investment recommendations
  _getRankedInvestments(): Recommendation[] {
    const investmentROI: { key: string; def: typeof DEFENSES[string]; gapsClosed: number; products: string[]; costPerGap: number }[] = [];

    for (const [dk, def] of Object.entries(DEFENSES)) {
      if (dk === 'threatModel' || dk === 'reqMgmt') continue;
      const currentLevel = this.defenses[dk] || 0;
      if (currentLevel >= MAX_DEFENSE_LEVEL) continue;
      const nextLevel = currentLevel + 1;
      const cost = def.setupCost;

      // Count how many gaps upgrading this would help close
      let gapsClosed = 0;
      const products = new Set<string>();
      for (const p of this.products.active) {
        for (const wk of this.getVisibleWeaknesses(p)) {
          if (p.mitigated.has(wk)) continue;
          const w = WEAKNESSES[wk];
          if (!w?.mitigations) continue;
          for (const path of w.mitigations) {
            if (dk in path.requires) {
              const needed = path.requires[dk];
              if (currentLevel < needed && nextLevel >= needed) {
                // Check if other requirements are also met
                const othersMet = Object.entries(path.requires).every(
                  ([k, v]) => k === dk || this.getEffectiveDefenseLevel(k) >= v
                );
                if (othersMet) { gapsClosed++; products.add(p.name); }
              }
            }
          }
        }
      }

      if (gapsClosed > 0) {
        investmentROI.push({ key: dk, def, gapsClosed, products: [...products], costPerGap: Math.round(cost / gapsClosed) });
      }
    }

    // Sort by cost per gap (best ROI first)
    investmentROI.sort((a, b) => a.costPerGap - b.costPerGap);

    return investmentROI.slice(0, 3).map(item => ({
      icon: item.def.icon,
      title: `Upgrade ${item.def.name} — best ROI`,
      detail: `$${item.costPerGap}K/gap. Fixes ${item.gapsClosed} on ${item.products.join(', ')}.`,
      actionType: 'upgrade' as const,
      actionKey: item.key,
      cost: item.def.setupCost,
    }));
  }

  // ─── SCORE ─────────────────────────────────────────────
  getScoreBreakdown(): ScoreBreakdown {
    const defTotal = Object.entries(DEFENSES)
      .filter(([, d]) => d.type === 'capability')
      .reduce((s, [k]) => s + (this.defenses[k] || 0), 0);
    const survivalPts = this.turn * 50;
    const valuationPts = Math.round(this.companyValue / 1000);
    const reputationPts = this.reputation * 10;
    const posturePts = this.securityPosture * 5;
    const blockedPts = this.totalBlocked * 30;
    const defensePts = defTotal * 20;
    const toolPts = (this.defenses.threatModel || 0) * 50 + (this.defenses.reqMgmt || 0) * 50;
    const quietPts = this.quietBonus;
    const breachPenalty = this.totalBreaches * 250;
    const total = Math.max(0, survivalPts + valuationPts + reputationPts + posturePts + blockedPts + defensePts + toolPts + quietPts - breachPenalty);
    return { survivalPts, valuationPts, reputationPts, posturePts, blockedPts, defensePts, toolPts, quietPts, breachPenalty, total };
  }

  getScore(): number { return this.getScoreBreakdown().total; }

  getGrade(): string {
    const s = this.getScore();
    return s >= 4000 ? 'A+' : s >= 3200 ? 'A' : s >= 2400 ? 'B' : s >= 1800 ? 'C' : s >= 1200 ? 'D' : 'F';
  }

  getBlindSpotSummary() {
    return {
      totalBreaches: this.totalBreaches,
      blindSpotBreaches: this.blindSpotBreaches,
      repLostToBlindSpots: this.blindSpotRepLost,
      degradationBreaches: this.degradationBreaches,
      totalDegradationEvents: this.totalDegradationEvents,
      totalFalsePositiveCost: this.totalFalsePositiveCost,
    };
  }

  // Which defense keys are relevant to the company right now
  getRelevantDefenses(): Set<string> {
    const relevant = new Set<string>();
    // Every company has corporate IT — these are always in scope
    const ALWAYS_RELEVANT = [
      'secTeam', 'awareness', 'identity', 'endpoint', 'network',
      'cloud', 'appSec', 'dataProtect', 'siem', 'ir', 'grc',
      'threatModel', 'reqMgmt', 'secAgents',
    ];
    for (const k of ALWAYS_RELEVANT) relevant.add(k);

    // AI-specific defenses only become relevant when AI products are in scope
    const activeWeaknesses = new Set<string>();
    for (const p of this.products.active) {
      for (const wk of p.weaknesses) activeWeaknesses.add(wk);
    }
    const AI_WEAKNESSES = ['PROMPT', 'AGENCY', 'POISON', 'LEAK', 'THEFT'];
    if (AI_WEAKNESSES.some(w => activeWeaknesses.has(w))) {
      relevant.add('aiSecurity');
    }

    // Also add defenses needed by mitigation paths of active weaknesses
    for (const wk of activeWeaknesses) {
      const w = WEAKNESSES[wk];
      if (!w?.mitigations) continue;
      for (const path of w.mitigations) {
        for (const dk of Object.keys(path.requires)) relevant.add(dk);
      }
    }
    return relevant;
  }

  getEstimatedBreachCost(): number {
    return Math.round(this.totalAttackCost / 100) / 10;
  }

  // Quarterly threat model risk assessment — drives next quarter's investment decisions
  getThreatModelReport(): { level: 'none' | 'active'; coveragePct: number; owaspPct: number; aiPct: number; totalRisks: number; hiddenRisks: number; canRevealMore: boolean; findings: { product: string; icon: string; weakness: string; wkLabel: string; severity: number; defended: boolean; effectiveLevel: number; source: string; nextAction: string; nextActionKey: string; nextActionCost: number | null; live: boolean }[]; summary: string } {
    if (this.threatModelLevel === 0) {
      const totalRisks = this.products.active.reduce((s, p) => s + p.weaknesses.length, 0);
      return { level: 'none', coveragePct: 0, owaspPct: 0, aiPct: 0, totalRisks, hiddenRisks: totalRisks, canRevealMore: true, findings: [], summary: '' };
    }

    const owaspPct = Math.round(this.getVisibilityRateForCategory('OWASP') * 100);
    const aiPct = Math.round(this.getVisibilityRateForCategory('AI/LLM') * 100);
    let totalRisks = 0;
    let hiddenRisks = 0;
    for (const p of this.products.active) {
      totalRisks += p.weaknesses.length;
      hiddenRisks += this.getHiddenWeaknessCount(p);
    }
    const coveragePct = totalRisks > 0 ? Math.round(((totalRisks - hiddenRisks) / totalRisks) * 100) : 100;
    const canRevealMore = coveragePct < 100;

    const findings: { product: string; icon: string; weakness: string; wkLabel: string; severity: number; defended: boolean; effectiveLevel: number; source: string; nextAction: string; nextActionKey: string; nextActionCost: number | null; live: boolean }[] = [];
    for (const p of this.products.active) {
      for (const wk of this.getVisibleWeaknesses(p)) {
        if (p.mitigated.has(wk)) continue;
        const w = WEAKNESSES[wk];
        if (!w) continue;
        const eff = this.getMitigationEffectiveness(wk, p);

        // Find the next defense investment that would help
        let nextAction = '';
        let nextActionKey = '';
        let nextActionCost: number | null = null;
        const path = this.getBestMatchedPath(wk);
        if (path && !path.met) {
          for (const [dk, minLevel] of Object.entries(path.requires)) {
            if (this.getEffectiveDefenseLevel(dk) < minLevel) {
              const def = DEFENSES[dk];
              if (def) {
                nextAction = `${def.name} → Lv${minLevel}`;
                nextActionKey = dk;
                nextActionCost = this.getUpgradeCost(dk);
                break;
              }
            }
          }
        } else if (path?.met && this.reqMgmtLevel > 0) {
          nextAction = 'Implement controls';
          nextActionKey = '';
          nextActionCost = this.getMitigationHours(wk);
        }

        findings.push({
          product: p.name, icon: p.icon, weakness: wk,
          wkLabel: w.label, severity: w.severity,
          defended: eff >= 0.5, effectiveLevel: Math.round(eff * 100),
          source: w.source, nextAction, nextActionKey, nextActionCost,
          live: !!p.launched,
        });
      }
    }

    findings.sort((a, b) => {
      if (a.live !== b.live) return a.live ? -1 : 1;
      if (a.defended !== b.defended) return a.defended ? 1 : -1;
      return b.severity - a.severity;
    });

    const exposed = findings.filter(f => !f.defended).length;
    const partial = findings.filter(f => f.defended).length;
    const summary = exposed === 0 && partial === 0
      ? 'All identified risks are addressed.'
      : `${exposed} exposed risk${exposed !== 1 ? 's' : ''}${partial > 0 ? `, ${partial} partially covered` : ''} across your portfolio.`;

    return { level: 'active', coveragePct, owaspPct, aiPct, totalRisks, hiddenRisks, canRevealMore, findings, summary };
  }

  // ─── HELPERS ───────────────────────────────────────────
  _calcPosture() {
    const capKeys = Object.entries(DEFENSES).filter(([, d]) => d.type === 'capability');
    const totalDef = capKeys.length * MAX_DEFENSE_LEVEL;
    const deployedDef = capKeys.reduce((s, [k]) => s + (this.defenses[k] || 0), 0);

    let mitigated = 0, total = 0;
    for (const p of this.products.active) {
      total += p.weaknesses.length;
      mitigated += p.mitigated.size;
    }

    const defScore = totalDef > 0 ? deployedDef / totalDef : 0;
    const reqScore = total > 0 ? mitigated / total : 0;
    this.securityPosture = Math.round(defScore * 40 + reqScore * 60);
  }

  _rollEvent() {
    const event = { ...EVENTS[Math.floor(Math.random() * EVENTS.length)] };
    switch (event.effect) {
      case 'budget_cut':       this.treasury = Math.round(this.treasury * (1 - event.value / 100)); break;
      case 'budget_boost':     this.treasury += Math.round(this.quarterlyBudget * event.value / 100); break;
      case 'revenue_boost':    this.companyValue = Math.round(this.companyValue * (1 + event.value / 100)); this.revenue = Math.round(this.revenue * (1 + event.value / 200)); break;
      case 'reputation_boost': this.reputation = Math.min(100, this.reputation + event.value); break;
      case 'cost_increase':    this.treasury -= Math.round(this.getMaintenanceCost() * event.value / 100); break;
      case 'compliance_test':  event.outcome = (this.defenses.grc || 0) >= 2 ? (this.reputation = Math.min(100, this.reputation + 3), 'Passed audit.') : (this.reputation -= 5, 'Failed audit.'); break;
      case 'patch_urgency':    event.outcome = (this.defenses.appSec || 0) >= 2 ? 'Patched quickly.' : (this.reputation -= 3, 'Slow to patch.'); break;
      case 'valuation_risk':   this.companyValue = Math.round(this.companyValue * 1.3); this.revenue = Math.round(this.revenue * 1.15); event.outcome = 'Valuation up, surface expanded.'; break;
    }
    return event;
  }

  _applyGrowth() {
    const rate = 0.03 + (this.reputation / 2000);
    const bonus = this.products.getTotalRevenue() / Math.max(this.revenue, 1) * 0.02;
    this.companyValue = Math.round(this.companyValue * (1 + rate + bonus));
    this.revenue = Math.round(this.revenue * (1 + (rate + bonus) * 0.5));

    const hadIncident = this.turnLog.some(e => e.type === 'attack' && e.data.result !== 'blocked');
    if (!hadIncident) {
      const bump = Math.max(40, Math.round(this.revenue * 0.03));
      this.revenue += bump;
      this.companyValue = Math.round(this.companyValue * 1.015);
      this.reputation = Math.min(100, this.reputation + 3);
      this.quietStreak++;
      const pts = 100 * this.quietStreak;
      this.quietBonus += pts;
      this.turnLog.push({
        type: 'trust',
        data: {
          bump, pts, streak: this.quietStreak,
          text: `Quiet quarter — customers trusted the product more. Revenue +$${bump}K/q, reputation +3, CISO score +${pts}.`,
        },
      });
    } else {
      this.quietStreak = 0;
    }
  }
}
