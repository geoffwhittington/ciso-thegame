/** Published evidence the engine is calibrated to — not flavor text. */

export const GUIDANCE_EVIDENCE = [
  {
    claim: 'Threat modeling in a security development lifecycle cut security defects ~50–60%.',
    source: 'Microsoft SDL',
    citation: 'Howard, MSDN Magazine, Nov 2005 — “Does SDL Work?”',
    url: 'https://learn.microsoft.com/en-us/archive/msdn-magazine/2005/november/a-look-inside-the-security-development-lifecycle-at-microsoft',
  },
  {
    claim: 'Windows Server 2003 (SDL practices, including threat models) had 63% fewer critical/important vulns in year one vs Windows 2000.',
    source: 'Microsoft / ACSAC',
    citation: 'Lipner, ACSAC 2004 — The Trustworthy Computing Security Development Lifecycle',
    url: 'https://www.acsac.org/2004/papers/Lipner.pdf',
  },
  {
    claim: 'Threat models with no follow-through on mitigations do not reduce risk.',
    source: 'Microsoft / ACSAC',
    citation: 'Lipner, ACSAC 2004 — models without testing mitigations “would not be effective at all”',
    url: 'https://www.acsac.org/2004/papers/Lipner.pdf',
  },
  {
    claim: 'Fixing a defect in production costs on the order of 30× fixing it in coding; design-phase work avoids 10–100× post-deploy cost.',
    source: 'NIST / SEI',
    citation: 'SEI citing NIST; NIST SP (pub_id 916027) — early SDLC mitigation vs post-deployment',
    url: 'https://www.sei.cmu.edu/blog/data-driven-software-assurance/',
  },
  {
    claim: 'Extensive prevention workflows (attack-surface, red team, posture) cut average breach cost by $2.2M vs none.',
    source: 'IBM Cost of a Data Breach 2024',
    citation: 'Largest savings in the 2024 report — prevention AI/automation workflows',
    url: 'https://newsroom.ibm.com/2024-07-30-ibm-report-escalating-data-breach-disruption-pushes-costs-to-new-highs',
  },
] as const;

/** Remaining attack volume at full TM+RM with controls. Howard 2005 ~50–60% fewer defects → keep 40%. */
export const SDL_ATTACK_REMAINING = 0.4;

/** Run-cost of a control when TM+RM cover it. Milder than NIST 30× so quarters still play; still a real cut. */
export const GUIDED_UPKEEP_MUL = 0.55;

/** Remaining incident $ when prevention (TM + requirements + matching controls) is in place. IBM CODB 2024 $2.2M / $4.88M ≈ 0.55 remaining. */
export const GUIDED_BREACH_LOSS_MUL = 0.55;
