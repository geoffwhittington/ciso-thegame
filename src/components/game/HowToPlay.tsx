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
    ceoLines: string[];
    devLines: string[];
  }[] = [
    {
      title: 'Money',
      stats: [
        { k: 'This quarter', v: `$${game.quarterlyBudget}K` },
        { k: 'Savings', v: game.treasury > 0 ? `$${game.treasury}K` : '$0' },
        { k: 'Can keep', v: `${carryPct}%` },
      ],
      ceoLines: [
        "Here's the budget. Spend wisely. Actually, spend as little as possible.",
        "The board approved your budget. I told them you'd return most of it.",
        "This should be plenty. I priced security software once in 2018.",
      ],
      devLines: [
        "It's never enough. Buy threat modeling first — its findings show up immediately, so you can spend the rest without guessing.",
        "Threat modeling first. Otherwise we're shopping for controls with a blindfold and Marcus's credit card.",
        "Find the gaps before buying tools. Revolutionary concept, apparently.",
      ],
    },
    {
      title: 'People & tools',
      topic: 'guided',
      stats: [
        { k: 'Board trust', v: `${game.reputation}/100` },
        { k: 'Hire closes', v: '1 risk/q' },
        { k: 'Alert overload?', v: 'Tools weaken' },
      ],
      ceoLines: [
        "Do we really need all these people? Can't the computer handle it?",
        "Another security hire? What if everyone just watched the training video?",
        "People need salaries. Have we considered one very motivated intern?",
      ],
      devLines: [
        "Threat models show risks. Requirements direct the team. Hires close gaps. Without all three, we're guessing.",
        "Tools create alerts. Humans investigate them. No, Marcus, the alerts cannot investigate themselves.",
        "Buy tools without staff and you've built a very expensive notification machine.",
      ],
    },
    {
      title: 'Attacks',
      topic: 'attacks',
      stats: [
        { k: 'Targets', v: 'Live products' },
        { k: 'In dev?', v: 'Safe for now' },
        { k: 'Rates from', v: 'Real data' },
      ],
      ceoLines: [
        "Wait — we actually get attacked?! I thought the firewall handled that!",
        "Can't we put a banner up saying unauthorized access is prohibited?",
        "Hackers target companies our size? That's flattering. Terrible, but flattering.",
      ],
      devLines: [
        "Hackers only hit what's in production. Lock it down before it ships.",
        "Pipeline products are your warning. Production products are the attackers' invitation.",
        "You get a planning window before launch. Use it, or enjoy explaining the breach to Victoria.",
      ],
    },
  ];

  const s = steps[step];
  const pickLine = (lines: string[], offset: number) =>
    lines[Math.abs(game.getDialogueSeed(step * 17 + offset)) % lines.length];

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl comic-card p-5 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black comic-heading text-brand">How This Works</h1>
            <p className="text-sm font-bold text-muted-foreground mt-0.5">Step {step + 1}/3 · {s.title}</p>
          </div>
          <button type="button" className="text-sm font-bold text-muted-foreground hover:text-foreground shrink-0" onClick={startOver}>← Back</button>
        </div>

        <div className="flex gap-2 mt-5" aria-hidden>
          {steps.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i === step ? 'bg-brand' : i < step ? 'bg-brand/50' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {s.stats.map(st => <ReviewStat key={st.k} k={st.k} v={st.v} />)}
        </div>

        <div className="space-y-2 mt-4">
          <PersonaMessage id="ceo" line={pickLine(s.ceoLines, 1)} />
          <PersonaMessage id="analyst" line={pickLine(s.devLines, 2)} />
        </div>

        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t-2 border-foreground/10">
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
