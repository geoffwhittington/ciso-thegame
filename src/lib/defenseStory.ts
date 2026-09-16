/** Grandma-facing: map each investment to attacks, not maturity labels. */

export const WEAKNESS_PLAIN: Record<string, string> = {
  AUTH: 'phishing & stolen passwords',
  ACCESS: 'people in the wrong accounts',
  INJ: 'injection (tricking software with bad input)',
  MISCONF: 'left-open cloud & network settings',
  VULN: 'unpatched / outdated software',
  EXPOSE: 'stolen company data',
  LOG: 'attacks nobody noticed',
  SSRF: 'tricking servers into hitting internals',
  SUPPLY: 'poisoned software suppliers',
  PROMPT: 'tricking AI with crafted text',
  LEAK: 'AI spilling secrets',
  AGENCY: 'AI taking actions it should not',
  POISON: 'tampered AI training data',
  THEFT: 'stolen AI models',
};

export const DEFENSE_STORY: Record<string, { covers: string; levels: string[] }> = {
  threatModel: {
    covers: 'Predict which attacks can hit each product so you fund the right defenses',
    levels: [
      'Anticipate common web/cloud attacks (phishing, open settings, injection)',
      'Also anticipate AI attacks (prompt tricks, agent abuse)',
      'Most products’ attack picture is visible',
      'Keeps up as new products launch',
      'Almost no attack type stays hidden',
    ],
  },
  reqMgmt: {
    covers: 'Execute: requirements and training so a purchased control actually stops the attack',
    levels: [
      'Starter controls are applied as intended',
      'Working programs get applied as intended',
      'Established controls get applied as intended',
      'Advanced controls get applied as intended',
      'Elite controls get applied as intended',
    ],
  },
  secTeam: {
    covers: 'A champion who can use the tools, plus a team that does the work',
    levels: [
      '1 champion and 4 teammates',
      '2 champions and 8 teammates',
      '3 champions and 12 teammates',
      '4 champions and 16 teammates',
      '5 champions and 20 teammates',
    ],
  },
  awareness: {
    covers: 'Phishing, reused passwords, and employees tricking (or being tricked by) AI',
    levels: [
      'Staff start spotting fake emails',
      'Fewer people fall for credential theft',
      'Developers write safer software (helps injection)',
      'Company-wide habit — phishing campaigns mostly fail',
      'Even tricky AI-related social attacks are practiced',
    ],
  },
  identity: {
    covers: 'Phishing, stolen passwords, and people reaching accounts they should not',
    levels: [
      'MFA — the #1 real-world breach pattern (stolen credentials)',
      'Tighter sign-in so one stolen password cannot roam',
      'Least-privilege: attackers cannot jump to admin',
      'Adaptive checks when a login looks wrong',
      'Near-zero trust — stolen creds rarely become a breach',
    ],
  },
  endpoint: {
    covers: 'Ransomware, unpatched laptops/servers, and sloppy device setups',
    levels: [
      'See and patch the obvious holes on devices',
      'Catch malware before it spreads',
      'Hardened defaults — fewer “left open” machines',
      'Fast response when a device is infected',
      'Ransomware and drive-by exploits mostly contained',
    ],
  },
  network: {
    covers: 'Injection, DDoS, servers tricked into hitting internals, open doors on the network',
    levels: [
      'Basic firewall — blocks noisy internet attacks',
      'Web filter that stops many injection attempts',
      'Network split so one hole cannot reach everything',
      'Harder for attackers to bounce inside',
      'Perimeter + internal paths both tightly watched',
    ],
  },
  cloud: {
    covers: 'Open cloud storage, wrong permissions, and data sitting exposed online',
    levels: [
      'Find buckets and ports left open (a top breach cause)',
      'Stop new products launching with unsafe defaults',
      'Lock down who can change cloud settings',
      'Catch drift before attackers do',
      'Cloud misconfig rarely becomes a headline breach',
    ],
  },
  appSec: {
    covers: 'Injection, known software bugs, and poisoned packages from suppliers',
    levels: [
      'Scan code for the bugs attackers actually use',
      'Catch known holes in libraries before ship',
      'Safer build pipeline — fewer supply-chain surprises',
      'Bugs found in testing, not after a breach',
      'Injection and dependency attacks mostly blocked',
    ],
  },
  dataProtect: {
    covers: 'Stolen customer/company data, and AI leaking secrets',
    levels: [
      'Encrypt the important files',
      'Stop data walking out the door unnoticed',
      'Cloud copies of data are locked too',
      'AI outputs are filtered so secrets do not spill',
      'A stolen laptop or prompt trick should not dump the crown jewels',
    ],
  },
  siem: {
    covers: 'Quiet attacks: stolen passwords in use, sneaky access, nobody watching the logs',
    levels: [
      'One place to see alarms',
      'Spot odd logins and access faster',
      'Connect the dots across tools',
      'Catch slow, quiet campaigns',
      'Few attacks run for weeks with no one noticing',
    ],
  },
  ir: {
    covers: 'Ransomware, data theft, and unpatched holes — after they have already started',
    levels: [
      'A written plan so people are not guessing',
      'Practice runs — faster containment',
      'Partner on call for big incidents',
      'Breaches shrink instead of spreading',
      'Major attacks get contained before they tank the quarter',
    ],
  },
  grc: {
    covers: 'Rules so access, logging, and suppliers are not “whoever remembered”',
    levels: [
      'Written rules for who can do what',
      'Audits catch “we skipped the control”',
      'Suppliers have to meet the same bar',
      'Gaps show up before regulators or attackers do',
      'Access and logging failures are rare and documented',
    ],
  },
  aiSecurity: {
    covers: 'Prompt tricks, runaway AI agents, poisoned training, stolen models',
    levels: [
      'Basic guardrails on AI answers',
      'Agents cannot take dangerous actions alone',
      'Watch the model for weird behavior',
      'Training data is checked before it teaches the AI',
      'Hard for attackers to steal or hijack the model',
    ],
  },
  secAgents: {
    covers: 'Each agent closes 1 extra risk per quarter. Staff must stay one level higher so people supervise.',
    levels: [
      'Closes 1 extra risk / q. Needs staff at 2.',
      'Closes 2 extra risks / q. Needs staff at 3.',
      'Closes 3 extra risks / q. Needs staff at 4.',
      'Closes 4 extra risks / q. Needs staff at 5.',
      'Staff must stay ahead. You cannot outrun people with agents.',
    ],
  },
};

export function defenseCovers(key: string): string {
  return DEFENSE_STORY[key]?.covers ?? '';
}

export function levelMeaning(key: string, level: number): string {
  const levels = DEFENSE_STORY[key]?.levels;
  if (!levels || level < 1 || level > levels.length) return '';
  return levels[level - 1];
}

export function countersPlain(helps: string[]): string {
  return helps.map(h => WEAKNESS_PLAIN[h] || h).join('; ');
}
