import { useState } from 'react';
import { useGame } from './GameContext';
import { AssumptionsHelp } from './AssumptionsHelp';
import type { AssumptionId } from '@/lib/assumptions';
import { UNUSED_CARRY_PCT } from '@/lib/simKnobs';
import { ReviewBlock, ReviewStat } from './ReviewChrome';
import { PersonaMessage } from './PersonaMessage';

export function HowToPlay() {
  const { game, update, startOver } = useGame();
  const [step, setStep] = useState(0);
  const carryPct = Math.round(UNUSED_CARRY_PCT * 100);
  const last = step === 2;

  const steps: {
    title: string;
    topic?: AssumptionId;
    stats: { k: string; v: string }[];
    ceoLine: string;
    devLine: string;
  }[] = [
    {
      title: 'Money',
      stats: [
        { k: 'This quarter', v: `$${game.quarterlyBudget}K` },
        { k: 'Savings', v: game.treasury > 0 ? `$${game.treasury}K` : '$0' },
        { k: 'Can keep', v: `${carryPct}%` },
      ],
      ceoLine: "Here's the budget. Spend wisely. Actually, spend as little as possible.",
      devLine: "It's never enough. Buy threat modeling first — its findings show up immediately, so you can spend the rest without guessing.",
    },
    {
      title: 'People & tools',
      topic: 'guided',
      stats: [
        { k: 'Board trust', v: `${game.reputation}/100` },
        { k: 'Hire closes', v: '1 risk/q' },
        { k: 'Alert overload?', v: 'Tools weaken' },
      ],
      ceoLine: "Do we really need all these people? Can't the computer handle it?",
      devLine: "Threat model shows the risks. Requirements tell the team what to do. Hires close gaps. Without all three, we're guessing.",
    },
    {
      title: 'Attacks',
      topic: 'attacks',
      stats: [
        { k: 'Targets', v: 'Live products' },
        { k: 'In dev?', v: 'Safe for now' },
        { k: 'Rates from', v: 'Real data' },
      ],
      ceoLine: "Wait — we actually get attacked?! I thought the firewall handled that!",
      devLine: "Hackers only hit what's in production. Lock it down before it ships.",
    },
  ];

  const s = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto comic-card p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black comic-heading text-brand">How This Works</h1>
            <p className="text-sm font-bold text-muted-foreground mt-0.5">Step {step + 1}/3 · {s.title}</p>
          </div>
          <button type="button" className="text-sm font-bold text-muted-foreground hover:text-foreground shrink-0" onClick={startOver}>← Back</button>
        </div>

        <div className="flex gap-1.5 mt-3" aria-hidden>
          {steps.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i === step ? 'bg-brand' : i < step ? 'bg-brand/50' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          {s.stats.map(st => <ReviewStat key={st.k} k={st.k} v={st.v} />)}
        </div>

        <PersonaMessage id="ceo" line={s.ceoLine} compact />
        <PersonaMessage id="analyst" line={s.devLine} compact />

        <div className="flex items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-3">
            <button className="comic-btn comic-btn-secondary text-sm" disabled={step === 0} onClick={() => setStep(step - 1)}>←</button>
            <AssumptionsHelp topic={s.topic} label="Sources" triggerClass="text-sm text-brand font-bold underline-offset-4 hover:underline" />
          </div>
          <button
            className="comic-btn comic-btn-primary"
            onClick={() => { if (!last) { setStep(step + 1); return; } game.phase = 'budget'; update(); }}
          >
            {last ? `Begin ${game.getCalendarQuarter(1)} →` : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
