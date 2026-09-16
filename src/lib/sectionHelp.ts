import type { AssumptionId } from './assumptions';
import { UNUSED_CARRY_PCT } from './simKnobs';

export type SectionHelpId =
  | 'status'
  | 'budget'
  | 'advisor'
  | 'systems'
  | 'investments'
  | 'endQuarter'
  | 'companyNews'
  | 'industryNews'
  | 'outcome'
  | 'attacks';

export interface SectionHelpCopy {
  title: string
  interpret: string
  act: string
  topic?: AssumptionId
}

export const SECTION_HELP: Record<SectionHelpId, SectionHelpCopy> = {
  status: {
    title: 'Board indicators',
    interpret: 'Reputation reflects board confidence. The appointment ends if it reaches zero. Grade is a running score for the engagement.',
    act: 'These figures are informational. Commit spend under Security Investments, then close the quarter.',
    topic: 'loss',
  },
  budget: {
    title: 'Quarterly funding',
    interpret: `The board allocates a security budget as a share of company revenue, plus a limited carry-forward of unused funds (at most ${Math.round(UNUSED_CARRY_PCT * 100)}% of that quarter's allocation). Operating cost of existing controls is deducted first. Allocation rises with revenue and reputation, and falls after incidents.`,
    act: 'Commit purchases under Security Investments. Increase Security Staff if alert volume exceeds capacity.',
    topic: 'staff',
  },
  advisor: {
    title: 'Suggested allocations',
    interpret: 'Up to three items the model can place on the current queue, given visibility and budget. This is a simulation output, not a prescribed plan.',
    act: 'The amount button adds the same commitment as the control on Security Investments. You may ignore or reverse it.',
    topic: 'anticipate',
  },
  systems: {
    title: 'Portfolio',
    interpret: 'The product roadmap is fixed. Production is in scope for incidents. Work still in scoping, build, testing, or rollout is not.',
    act: 'Threat modeling shows specific gaps. Matching control names add that investment to the quarterly queue.',
    topic: 'pipeline',
  },
  investments: {
    title: 'Security investments',
    interpret: 'Add commits a level at quarter close. Remove cancels the last commitment. Markers: owned, pending this quarter, aimed by threat modeling and requirements, or out of scope for current systems.',
    act: 'Controls apply generically across products. Threat modeling shows gaps. Security requirements let staff close listed gaps. Setup is charged this quarter; operating cost continues while the level is held.',
    topic: 'guided',
  },
  endQuarter: {
    title: 'Close the quarter',
    interpret: 'Commitments become live, incidents are applied to production systems, and staff close listed gaps if security requirements and capacity exist.',
    act: 'Confirm to proceed, or return to revise the queue.',
    topic: 'attacks',
  },
  companyNews: {
    title: 'Internal activity',
    interpret: 'Events inside NovaMind this quarter, including launches and operational setbacks.',
    act: 'Review, then continue to the next quarter.',
    topic: 'pipeline',
  },
  industryNews: {
    title: 'Industry context',
    interpret: 'External headlines. These are not incidents against NovaMind.',
    act: 'Informational. Allocations remain on the budget screen.',
  },
  outcome: {
    title: 'Quarter outcome',
    interpret: 'Counts of incidents prevented, limited, or resulting in a breach this quarter.',
    act: 'Internal activity and industry context follow. Continue when you have reviewed them.',
    topic: 'attacks',
  },
  attacks: {
    title: 'Incidents this quarter',
    interpret: 'Each row is an incident against production systems: prevented, limited, or a breach with reputation and financial impact.',
    act: 'Use the accompanying rationale to adjust the next quarter\'s commitments.',
    topic: 'attacks',
  },
};
