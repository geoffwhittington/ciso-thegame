import { GUIDANCE_EVIDENCE } from './guidanceEvidence';
import { SOURCE_URLS } from './sources';

export type AssumptionId =
  | 'anticipate'
  | 'execute'
  | 'guided'
  | 'staff'
  | 'attacks'
  | 'pipeline'
  | 'loss';

export interface AssumptionCitation {
  label: string
  url: string
}

export interface Assumption {
  id: AssumptionId
  title: string
  mechanic: string
  basis: string[]
  citations: AssumptionCitation[]
}

const howard = GUIDANCE_EVIDENCE[0];
const lipnerWin = GUIDANCE_EVIDENCE[1];
const lipnerExec = GUIDANCE_EVIDENCE[2];
const nist = GUIDANCE_EVIDENCE[3];
const ibm = GUIDANCE_EVIDENCE[4];

export const ASSUMPTIONS: Assumption[] = [
  {
    id: 'anticipate',
    title: 'Threat modeling',
    mechanic: 'Buying threat modeling shows the gaps on products in scope. Without it, controls still apply as a generic setup and the board only sees industry-level estimates.',
    basis: [howard.claim],
    citations: [{ label: howard.citation, url: howard.url }],
  },
  {
    id: 'execute',
    title: 'Security requirements',
    mechanic: 'Staff can close listed gaps only after security requirements exist. Generic controls still apply across products without them.',
    basis: [lipnerExec.claim],
    citations: [{ label: lipnerExec.citation, url: lipnerExec.url }],
  },
  {
    id: 'guided',
    title: 'Threat modeling and requirements strengthen controls',
    mechanic: 'You can buy security tools without threat modeling. They still help a little — like the same generic lock on every door. Threat modeling writes down the real weak spots. Security requirements tell the team how to use the tools on those spots, so the tools work much better. Doing both also means fewer attacks show up — about half as many, from studies of building software securely.',
    basis: [howard.claim, lipnerWin.claim],
    citations: [
      { label: howard.citation, url: howard.url },
      { label: lipnerWin.citation, url: lipnerWin.url },
    ],
  },
  {
    id: 'staff',
    title: 'People operate the tools',
    mechanic: 'Each Security Staff champion closes one visible gap at quarter end. Alerting tools that exceed staff capacity drop one level that quarter.',
    basis: ['The simulation treats unused alerts as an operations failure, not a cash penalty. IBM reports the largest average savings from prevention workflows that include people and process, not tools alone.'],
    citations: [{ label: ibm.citation, url: ibm.url }],
  },
  {
    id: 'attacks',
    title: 'Incident rates',
    mechanic: 'Each quarter, live systems are rolled against attack frequencies taken from published studies. Outcomes are blocked, contained, or breach.',
    basis: ['Quarterly probabilities are mapped from annual rates in Verizon DBIR, OWASP Top 10 / LLM Top 10, and related sources cited on each attack.'],
    citations: [
      { label: 'Verizon DBIR 2024', url: SOURCE_URLS['Verizon DBIR 2024'] },
      { label: 'OWASP Top 10', url: SOURCE_URLS['OWASP Top 10'] },
      { label: 'OWASP LLM Top 10', url: SOURCE_URLS['OWASP LLM Top 10'] },
    ],
  },
  {
    id: 'pipeline',
    title: 'Build, test, deploy',
    mechanic: 'Only live (production) systems can be attacked. Systems still in scoping, build, testing, or rollout cannot be hit until they ship. The CISO role does not build products; the roadmap is on a fixed schedule. Live product revenue is a scheduled contribution that sizes the security budget, not a control you purchased.',
    basis: [nist.claim],
    citations: [{ label: nist.citation, url: nist.url }],
  },
  {
    id: 'loss',
    title: 'Incident cost and reputation',
    mechanic: 'Breach loss is the cited average incident cost. Contained incidents charge a small IR slice. Blocked incidents cost $0. Reputation at zero ends the appointment. Interim (3Q) starts at lower board confidence so a couple of breaches can end the tour.',
    basis: [ibm.claim],
    citations: [{ label: ibm.citation, url: ibm.url }],
  },
];

export function assumptionById(id: AssumptionId): Assumption {
  return ASSUMPTIONS.find(a => a.id === id)!;
}
