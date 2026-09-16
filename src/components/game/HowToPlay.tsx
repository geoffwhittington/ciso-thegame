import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from './GameContext';
import { AssumptionsHelp } from './AssumptionsHelp';
import type { AssumptionId } from '@/lib/assumptions';
import { UNUSED_CARRY_PCT, budgetRate } from '@/lib/simKnobs';
import { ReportRow } from './ReportRow';
import { ReviewBlock, ReviewStat } from './ReviewChrome';

export function HowToPlay() {
  const { game, update, startOver } = useGame();
  const [step, setStep] = useState(0);
  const pct = Math.round(budgetRate(game.reputation) * 1000) / 10;
  const carryPct = Math.round(UNUSED_CARRY_PCT * 100);
  const last = step === 2;

  const steps: {
    title: string;
    topic?: AssumptionId;
    stats: { k: string; v: string }[];
    row: { mark: string; title: string; body: string };
  }[] = [
    {
      title: 'Your money',
      stats: [
        { k: 'This quarter', v: `$${game.quarterlyBudget}K` },
        { k: 'In the drawer', v: game.treasury > 0 ? `$${game.treasury}K` : '$0' },
        { k: 'Share of sales', v: `${pct}%` },
        { k: 'Leftover you can keep', v: `${carryPct}%` },
      ],
      row: {
        mark: '💰',
        title: 'Spend the budget you have',
        body: `The board gave you $${game.quarterlyBudget}K this quarter. Pay to keep tools you already own, then buy new ones. If they still trust you, you get more later. If you get hacked, you get less. You can keep at most ${carryPct}% of leftover money.`,
      },
    },
    {
      title: 'People and tools',
      topic: 'guided',
      stats: [
        { k: 'Board trust', v: `${game.reputation}/100` },
        { k: 'Gaps a hire can close', v: '1 / quarter' },
        { k: 'If alerts pile up', v: 'Tools weaken' },
        { k: 'Your job', v: 'Aim the spend' },
      ],
      row: {
        mark: '👥',
        title: 'See the risks. Use the tools. Hire people.',
        body: 'Threat modeling shows how live products get attacked. Security requirements tell the team how to use the tools. Each hire can close one listed gap when the quarter ends. Too many alerts and those tools work worse.',
      },
    },
    {
      title: 'The attacks',
      topic: 'attacks',
      stats: [
        { k: 'What can be hit', v: 'Live products' },
        { k: 'Still being built', v: 'Safe for now' },
        { k: 'Rates from', v: 'Real reports' },
        { k: 'If trust hits 0', v: 'You are out' },
      ],
      row: {
        mark: '🚨',
        title: 'Hackers only hit what customers already use',
        body: 'The attack rates come from real industry reports. Software still being built cannot be hit yet. Lock it down before it goes live.',
      },
    },
  ];

  const s = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">How this works</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Step {step + 1} of 3 · {s.title}
            </p>
          </div>
          <button type="button" className="text-sm text-muted-foreground hover:text-foreground shrink-0" onClick={startOver}>
            Return to start
          </button>
        </div>

        <div className="flex gap-2 mt-4" aria-hidden>
          {steps.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i === step ? 'bg-brand' : i < step ? 'bg-brand/50' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          {s.stats.map(st => (
            <ReviewStat key={st.k} k={st.k} v={st.v} />
          ))}
        </div>

        <ReviewBlock title={s.title}>
          <ul className="space-y-2">
            <ReportRow mark={s.row.mark} title={s.row.title}>
              {s.row.body}
            </ReportRow>
          </ul>
        </ReviewBlock>

        <div className="flex items-center justify-between gap-3 mt-5">
          <div className="flex items-center gap-3">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
              Back
            </Button>
            <AssumptionsHelp topic={s.topic} label="Research sources" triggerClass="text-sm text-brand underline-offset-4 hover:underline" />
          </div>
          <Button
            onClick={() => {
              if (!last) { setStep(step + 1); return; }
              game.phase = 'budget';
              update();
            }}
          >
            {last ? `Begin ${game.getCalendarQuarter(1)}` : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
