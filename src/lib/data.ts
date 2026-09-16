// Core catalogs — weaknesses, attacks, defenses (including tools), events
// Frequencies: Verizon DBIR 2024, OWASP Top 10 2021, OWASP LLM Top 10 2025, MITRE ATLAS, IBM CODB 2024

// ─── WEAKNESSES ──────────────────────────────────────────
// Loaded from /data/weaknesses.json at runtime — not compiled into app code.

export interface MitigationPath {
  requires: Record<string, number>;
  effectiveness: number;
  hint: string;
}

export interface Weakness {
  id: string;
  name: string;
  label: string;
  quarterlyProb: number;
  severity: number;
  category: 'OWASP' | 'AI/LLM';
  desc: string;
  source: string;
  citation: string;
  sourceUrl: string;
  annualRate: string;
  mitigations: MitigationPath[];
}

// Populated at startup via loadWeaknesses()
export let WEAKNESSES: Record<string, Weakness> = {};

export async function loadWeaknesses(): Promise<void> {
  // Base-relative so it resolves under a GitHub Pages subpath (import.meta.env.BASE_URL).
  const resp = await fetch(`${import.meta.env.BASE_URL}data/weaknesses.json`);
  WEAKNESSES = await resp.json();
}

export function hydrateWeaknesses(data: Record<string, Weakness>): void {
  WEAKNESSES = data;
}

// ─── DEFENSE CATEGORIES ──────────────────────────────────
export type DefenseType = 'capability' | 'tool';

export interface Defense {
  name: string;
  icon: string;
  type: DefenseType;
  setupCost: number;
  maintainCost: number;
  alertLoad: number;        // alert volume generated per level — requires secTeam to triage
  desc: string;
  helps: string[];
}

export const DEFENSES: Record<string, Defense> = {
  // ── Capabilities ──
  secTeam:     { name: 'Security Staff',         icon: '👥', type: 'capability', setupCost: 50,  maintainCost: 16, alertLoad: 0, desc: 'Each hire is one champion who can use the tools, plus 4 teammates who close risks each quarter.',              helps: ['ACCESS', 'EXPOSE', 'AGENCY'] },
  awareness:   { name: 'Security Awareness',     icon: '🎓', type: 'capability', setupCost: 20,  maintainCost: 5,  alertLoad: 0, desc: 'Phishing sims, secure coding training',            helps: ['AUTH', 'INJ', 'PROMPT'] },
  identity:    { name: 'Identity & Access Mgmt', icon: '🔑', type: 'capability', setupCost: 45,  maintainCost: 12, alertLoad: 0, desc: 'SSO, MFA, PAM, zero-trust policies',               helps: ['AUTH', 'ACCESS'] },
  endpoint:    { name: 'Endpoint & EDR',         icon: '💻', type: 'capability', setupCost: 40,  maintainCost: 10, alertLoad: 2, desc: 'Endpoint detection, patching, device mgmt',        helps: ['VULN', 'MISCONF'] },
  network:     { name: 'Network & Perimeter',    icon: '🌐', type: 'capability', setupCost: 45,  maintainCost: 12, alertLoad: 0, desc: 'Firewalls, WAF, DDoS, segmentation',               helps: ['INJ', 'SSRF', 'MISCONF'] },
  cloud:       { name: 'Cloud Security',         icon: '☁️', type: 'capability', setupCost: 50,  maintainCost: 14, alertLoad: 2, desc: 'CSPM, container security, CWPP',                   helps: ['MISCONF', 'ACCESS', 'EXPOSE'] },
  appSec:      { name: 'Application Security',   icon: '🔧', type: 'capability', setupCost: 45,  maintainCost: 12, alertLoad: 3, desc: 'SAST, DAST, SCA, secure SDLC',                     helps: ['INJ', 'VULN', 'SUPPLY'] },
  dataProtect: { name: 'Data Protection',        icon: '🗄️', type: 'capability', setupCost: 40,  maintainCost: 10, alertLoad: 0, desc: 'Encryption, DLP, classification',                  helps: ['EXPOSE', 'LEAK'] },
  siem:        { name: 'SIEM & Monitoring',      icon: '📡', type: 'capability', setupCost: 55,  maintainCost: 16, alertLoad: 4, desc: 'Log aggregation, alerting, detection',             helps: ['LOG', 'ACCESS', 'AUTH'] },
  ir:          { name: 'Incident Response',      icon: '🚨', type: 'capability', setupCost: 30,  maintainCost: 8,  alertLoad: 0, desc: 'IR plans, tabletops, retainers',                   helps: ['LOG', 'EXPOSE', 'VULN'] },
  grc:         { name: 'GRC & Compliance',       icon: '📋', type: 'capability', setupCost: 25,  maintainCost: 6,  alertLoad: 0, desc: 'Policy frameworks, audits, regulatory',            helps: ['ACCESS', 'LOG', 'SUPPLY'] },
  aiSecurity:  { name: 'AI/ML Security',         icon: '🤖', type: 'capability', setupCost: 55,  maintainCost: 16, alertLoad: 0, desc: 'Guardrails, model monitoring, red team',            helps: ['PROMPT', 'AGENCY', 'POISON', 'LEAK', 'THEFT'] },
  secAgents:   { name: 'Security Automation',    icon: '⚡', type: 'capability', setupCost: 40,  maintainCost: 10, alertLoad: 0, desc: 'Each agent closes 1 extra risk per quarter. Staff must stay one level higher so people stay in charge.', helps: [] },
  // ── Anticipate & execute ──
  threatModel: { name: 'Threat modeling', icon: '🔍', type: 'tool', setupCost: 25,  maintainCost: 8, alertLoad: 0, desc: 'Assess the risk of the systems so you fund the right controls. Includes the people who do the analysis.', helps: [] },
  reqMgmt:     { name: 'Security requirements', icon: '📝', type: 'tool', setupCost: 30,  maintainCost: 10, alertLoad: 0, desc: 'Write how the team must use those controls so they actually stop the attacks — not just sit on a slide.', helps: [] },
};

export const MAX_DEFENSE_LEVEL = 5;
export { levelMeaning, defenseCovers, countersPlain } from './defenseStory';
export const STAFF_CAPACITY_PER_LEVEL = 6;
/** Each Security Staff hire is 1 champion plus this many teammates. */
export const TEAM_MEMBERS_PER_CHAMPION = 4;
/** One supervised agent closes this many extra risks per quarter. */
export const AGENT_FIX_SLOTS_PER_LEVEL = 1;

// ─── INVESTMENT DEPENDENCIES ─────────────────────────────
// Real-world technology interdependencies between security investments.
// requires: must be at this level or the defense underperforms (effective level capped)
// boosts: having this defense at sufficient level gives a bonus
// riskIf: deploying without prereq creates NEW attack surface
export interface DefenseDependency {
  requires?: Record<string, number | 'level' | 'level+1'>;  // 'level' = same level, 'level+1' = one higher
  boosts?: string[];                                          // these defenses enhance this one
  riskIf?: { missing: string; minLevel: number; weakness: string; desc: string };
}

export const DEFENSE_DEPENDENCIES: Record<string, DefenseDependency> = {
  // Security Automation: needs AI/ML Security at agent_level+1 or agents become attack surface
  // Needs staff to supervise
  secAgents:   { requires: { secTeam: 'level+1', aiSecurity: 'level+1' }, riskIf: { missing: 'aiSecurity', minLevel: 0, weakness: 'AGENCY', desc: 'Your security automation agents can be abused until AI/ML Security is one level higher than they are.' } },
  // Identity & Access Mgmt: needs GRC for policy foundation
  identity:    { requires: { grc: 1 }, boosts: ['siem'] },
  // SIEM: needs IR to act on detections
  siem:        { requires: {}, boosts: ['ir'] },
  // IR: needs SIEM to detect incidents
  ir:          { requires: { siem: 1 } },
  // Data Protection: benefits from Cloud Security for cloud data
  dataProtect: { requires: {}, boosts: ['cloud'] },
  // Cloud Security: benefits from Network for segmentation
  cloud:       { requires: {}, boosts: ['network'] },
  // AI/ML Security: needs AppSec for testing guardrails
  aiSecurity:  { requires: { appSec: 1 } },
  // AppSec: benefits from Awareness for dev training
  appSec:      { boosts: ['awareness'] },
};

// ─── ATTACKS ─────────────────────────────────────────────
export interface Attack {
  name: string;
  exploits: string[];
  quarterlyProb: number;
  annualRate: string;
  severity: number;
  costEstimate: string;
  desc: string;
  source: string;
  citation: string;
}

export const ATTACKS: Attack[] = [
  { name: 'Phishing Campaign',       exploits: ['AUTH'],                quarterlyProb: 0.75, annualRate: '36% of breaches',       severity: 2, costEstimate: '$4.88M avg', desc: 'Mass phishing targeting employee credentials',     source: 'Verizon DBIR 2024', citation: 'Figure 35 — Social Engineering patterns' },
  { name: 'Credential Stuffing',     exploits: ['AUTH'],                quarterlyProb: 0.55, annualRate: '31% of breaches',       severity: 2, costEstimate: '$4.81M avg', desc: 'Automated credential reuse from past breaches',    source: 'Verizon DBIR 2024', citation: 'Figure 15 — Use of stolen credentials' },
  { name: 'Injection Attack',        exploits: ['INJ'],                 quarterlyProb: 0.40, annualRate: '3% incidence rate',     severity: 3, costEstimate: '$4.67M avg', desc: 'SQL/NoSQL/OS injection via application inputs',    source: 'OWASP Top 10',     citation: 'A03:2021 — 94% of apps tested' },
  { name: 'Access Control Bypass',   exploits: ['ACCESS'],              quarterlyProb: 0.45, annualRate: '94% of apps tested',    severity: 3, costEstimate: '$4.67M avg', desc: 'Unauthorized access to restricted resources',      source: 'OWASP Top 10',     citation: 'A01:2021 — #1 web app risk' },
  { name: 'Cloud Misconfiguration',  exploits: ['MISCONF', 'ACCESS'],   quarterlyProb: 0.35, annualRate: '23% of breaches',       severity: 3, costEstimate: '$4.14M avg', desc: 'Exposed storage, open ports, default configs',     source: 'Verizon DBIR 2024', citation: 'Figure 42 — Misconfiguration errors' },
  { name: 'DDoS Attack',             exploits: ['MISCONF'],             quarterlyProb: 0.30, annualRate: '18% of incidents',      severity: 2, costEstimate: '$1.2M avg',  desc: 'Distributed denial of service',                   source: 'Verizon DBIR 2024', citation: 'Figure 8 — DoS patterns' },
  { name: 'Prompt Injection',        exploits: ['PROMPT'],              quarterlyProb: 0.35, annualRate: '35% of AI-deploying orgs', severity: 4, costEstimate: '$5.2M avg', desc: 'Crafted inputs manipulate AI behavior',            source: 'OWASP LLM Top 10', citation: 'LLM01 — industry AI survey' },
  { name: 'Data Exfiltration',       exploits: ['EXPOSE', 'LEAK'],      quarterlyProb: 0.25, annualRate: '15% of breaches',       severity: 4, costEstimate: '$5.46M avg', desc: 'Sensitive data extracted from systems',            source: 'Verizon DBIR 2024', citation: 'Figure 29 — Data disclosure' },
  { name: 'Ransomware',              exploits: ['VULN', 'MISCONF'],     quarterlyProb: 0.20, annualRate: '32% of breaches',       severity: 5, costEstimate: '$5.13M avg', desc: 'Encryption-based extortion',                      source: 'Verizon DBIR 2024', citation: 'Figure 12 — Ransomware + extortion' },
  { name: 'Supply Chain Compromise', exploits: ['SUPPLY', 'VULN'],      quarterlyProb: 0.12, annualRate: '15% of breaches',       severity: 4, costEstimate: '$4.63M avg', desc: 'Malicious code via trusted dependency',            source: 'Verizon DBIR 2024', citation: 'Figure 50 — Supply chain vectors' },
  { name: 'Insider Threat',          exploits: ['ACCESS', 'EXPOSE'],    quarterlyProb: 0.10, annualRate: '35% involve insiders',  severity: 4, costEstimate: '$4.99M avg', desc: 'Malicious or negligent insider',                   source: 'Verizon DBIR 2024', citation: 'Figure 4 — Internal actors' },
  { name: 'Agent Abuse',             exploits: ['AGENCY', 'PROMPT'],    quarterlyProb: 0.20, annualRate: '25% of AI-deploying orgs', severity: 4, costEstimate: '$5.2M avg', desc: 'AI agent takes unauthorized actions',               source: 'OWASP LLM Top 10', citation: 'LLM08 — MITRE ATLAS CS0016' },
  { name: 'Training Data Extraction', exploits: ['LEAK', 'PROMPT'],     quarterlyProb: 0.15, annualRate: '20% of AI-deploying orgs', severity: 4, costEstimate: '$5.46M avg', desc: 'LLM manipulated to reveal training data',           source: 'OWASP LLM Top 10', citation: 'LLM06 — MITRE ATLAS CS0014' },
  { name: 'Model Poisoning',         exploits: ['POISON'],              quarterlyProb: 0.08, annualRate: '8% of ML pipelines',    severity: 5, costEstimate: '$6.1M avg',  desc: 'Compromised training pipeline',                    source: 'OWASP LLM Top 10', citation: 'LLM03 — MITRE ATLAS CS0012' },
  { name: 'Model Theft',             exploits: ['THEFT', 'ACCESS'],     quarterlyProb: 0.10, annualRate: '10% of AI-deploying orgs', severity: 4, costEstimate: '$4.5M avg', desc: 'Model weights extracted via API',                   source: 'OWASP LLM Top 10', citation: 'LLM10 — MITRE ATLAS CS0010' },
  { name: 'SSRF Attack',             exploits: ['SSRF'],                quarterlyProb: 0.15, annualRate: '2% incidence rate',     severity: 3, costEstimate: '$4.67M avg', desc: 'Server tricked into internal requests',            source: 'OWASP Top 10',     citation: 'A10:2021 — New in 2021 Top 10' },
  { name: 'Zero-Day Exploit',        exploits: ['VULN'],                quarterlyProb: 0.05, annualRate: '3% of breaches',        severity: 5, costEstimate: '$6.1M avg',  desc: 'Unknown vulnerability exploited',                  source: 'Verizon DBIR 2024', citation: 'Figure 48 — Zero-day activity' },
  { name: 'APT Campaign',            exploits: ['AUTH', 'ACCESS', 'LOG'], quarterlyProb: 0.05, annualRate: '6% of breaches',       severity: 5, costEstimate: '$6.1M avg',  desc: 'Sophisticated persistent threat',                  source: 'Verizon DBIR 2024', citation: 'Figure 6 — Nation-state actors' },
];

/** IBM/DBIR-style loss in game $K ($4.88M → 4880). */
export function industryLossK(costEstimate: string): number {
  const m = costEstimate.match(/\$([0-9.]+)\s*M/i);
  return m ? Math.round(parseFloat(m[1]) * 1000) : 4880;
}

// ─── DEGRADATION EVENTS ──────────────────────────────────
// Random operational incidents that temporarily degrade defenses
export interface DegradationEvent {
  text: string;
  targets: string;
  icon: string;
}

export const DEGRADATION_EVENTS: DegradationEvent[] = [
  { text: 'Your lead IAM architect left for a competitor',             targets: 'identity',    icon: '🚪' },
  { text: 'CSPM vendor pushed a breaking update',                     targets: 'cloud',       icon: '🐛' },
  { text: 'SIEM license audit locked your account for 3 weeks',       targets: 'siem',        icon: '📄' },
  { text: 'Firewall rules drifted after a change window',             targets: 'network',     icon: '🔧' },
  { text: 'EDR agent crashed after an OS update',                     targets: 'endpoint',    icon: '💥' },
  { text: 'AppSec scanner upgrade introduced false negatives',        targets: 'appSec',      icon: '⚠️' },
  { text: 'Key incident responder went on extended leave',            targets: 'ir',          icon: '🏥' },
  { text: 'Data classification tool lost sync with cloud storage',    targets: 'dataProtect', icon: '🔌' },
  { text: 'GRC platform migration caused policy gaps',                targets: 'grc',         icon: '📋' },
  { text: 'Security awareness vendor went out of business',           targets: 'awareness',   icon: '🏚️' },
  { text: 'AI guardrails config was overwritten during deployment',   targets: 'aiSecurity',  icon: '🤖' },
  { text: 'Threat model database corrupted — reverting to backups',   targets: 'threatModel', icon: '🗄️' },
  { text: 'Requirements stopped applying to new code this quarter',  targets: 'reqMgmt',     icon: '🔗' },
];

export const DEGRADATION_BASE_PROB = 0.08;
export const DEGRADATION_STAFF_REDUCTION = 0.015;
export const DEGRADATION_MAX_PER_QUARTER = 2;

// ─── EVENTS ──────────────────────────────────────────────
export interface GameEvent {
  name: string;
  effect: string;
  value: number;
  flavor: string;
  icon: string;
  outcome?: string;
}

export const EVENTS: GameEvent[] = [
  { name: 'Board Demands Growth',     effect: 'budget_cut',       value: 15,  flavor: 'Board wants more R&D. Security budget cut 15%.', icon: '📉' },
  { name: 'Competitor Breached',       effect: 'budget_boost',     value: 20,  flavor: 'Rival\'s breach makes headlines. Board approves 20% increase.', icon: '📰' },
  { name: 'Series Funding',           effect: 'revenue_boost',     value: 25,  flavor: 'New funding round! Valuation jumps 25%.', icon: '💰' },
  { name: 'Talent Shortage',          effect: 'cost_increase',     value: 20,  flavor: 'Security talent market tightens. Costs up.', icon: '🏷️' },
  { name: 'Bug Bounty Win',           effect: 'reputation_boost',  value: 5,   flavor: 'Bug bounty catches critical vuln early.', icon: '🏆' },
  { name: 'Customer Audit',           effect: 'compliance_test',   value: 2,   flavor: 'Enterprise customer demands security audit.', icon: '🔍' },
  { name: 'Critical CVE Published',   effect: 'patch_urgency',     value: 2,   flavor: 'Critical CVE in a widely-used library.', icon: '🐛' },
  { name: 'Quiet Quarter',            effect: 'none',              value: 0,   flavor: 'A rare calm quarter.', icon: '😌' },
  { name: 'Acquisition Target',       effect: 'valuation_risk',    value: 30,  flavor: 'Acquiring a startup — valuation up, risk up.', icon: '🤝' },
  { name: 'SEC Cyber Disclosure Rule', effect: 'compliance_test',  value: 3,   flavor: 'New SEC rules require material incident disclosure within 4 days.', icon: '⚖️' },
  { name: 'Key Hire Poached',         effect: 'cost_increase',     value: 15,  flavor: 'Your CISO deputy was recruited away. Backfill costs spike.', icon: '💼' },
  { name: 'Board Security Briefing',  effect: 'reputation_boost',  value: 3,   flavor: 'Board impressed by your quarterly risk briefing.', icon: '📊' },
];

export const MILESTONES = [
  { turn: 2,  name: 'Series A',           valuationBoost: 20 },
  { turn: 4,  name: 'Product-Market Fit', valuationBoost: 25 },
  { turn: 8,  name: 'Series B',           valuationBoost: 35 },
  { turn: 12, name: 'Series C',           valuationBoost: 40 },
  { turn: 16, name: 'Enterprise Clients', valuationBoost: 50 },
  { turn: 20, name: 'IPO Ready',          valuationBoost: 0 },
];
