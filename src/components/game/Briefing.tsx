import { Button } from '@/components/ui/button';
import { useGame } from './GameContext';
import { UNUSED_CARRY_PCT, budgetRate } from '@/lib/simKnobs';
import { ReportRow } from './ReportRow';
import { ReviewBlock, ReviewStat } from './ReviewChrome';

export function Briefing({ onBegin }: { onBegin: () => void }) {
  const { game, startOver } = useGame();
  const pct = Math.round(budgetRate(game.reputation) * 1000) / 10;
  const carryPct = Math.round(UNUSED_CARRY_PCT * 100);
  const live = game.products.getLiveProducts();
  const worth = `$${(game.companyValue / 1000).toFixed(0)} million`;
  const inPerQ = `$${(game.revenue / 1000).toFixed(0)} million`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-xl border border-border bg-card p-6 sm:p-10 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Your first day</h1>
            <p className="text-lg text-muted-foreground mt-2">NovaMind · you are the head of security</p>
          </div>
          <button type="button" className="text-lg text-muted-foreground hover:text-foreground shrink-0" onClick={startOver}>
            Return to start
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <ReviewStat k="Company worth" v={`$${(game.companyValue / 1000).toFixed(0)}M`} />
          <ReviewStat k="Money in / quarter" v={`$${(game.revenue / 1000).toFixed(0)}M`} />
          <ReviewStat k="Board trust" v={`${game.reputation}/100`} />
          <ReviewStat k="Your budget" v={`$${game.quarterlyBudget}K`} />
        </div>

        <ReviewBlock title="The company">
          <p className="text-lg text-muted-foreground">
            NovaMind sells AI software to other businesses. The company is worth {worth} and brings in about {inPerQ} each quarter.
          </p>
        </ReviewBlock>

        <ReviewBlock title="Your money">
          <p className="text-lg text-muted-foreground">
            The board gave you ${game.quarterlyBudget}K this quarter to spend on security
            {game.treasury > 0 ? ` (plus $${game.treasury}K already in the drawer)` : ''}.
            That is about {pct}% of what the company takes in.
            You pay to keep tools you already bought before you buy new ones.
            If the board still trusts you, the budget goes up. If you get hacked, it goes down.
            You can keep at most {carryPct}% of leftover money for next quarter.
          </p>
        </ReviewBlock>

        <ReviewBlock title="Portfolio">
          <ul className="space-y-3">
            {live.map(p => (
              <ReportRow key={p.id} mark={p.icon} title={p.name}>
                Live. {p.desc}
              </ReportRow>
            ))}
          </ul>
          <p className="text-lg text-muted-foreground mt-3">
            More products will show up later. Hackers can only hit what is live, not what is still being built.
          </p>
        </ReviewBlock>

        <ReviewBlock title="Your job">
          <p className="text-lg text-muted-foreground">
            You have {game.maxTurns} quarters ({game.getCalendarQuarter(1)} to {game.getCalendarQuarter(game.maxTurns)}).
            Keep board trust above 0. If it hits 0, you are out.
          </p>
        </ReviewBlock>

        <div className="flex justify-end mt-8">
          <Button size="lg" className="text-lg px-8" onClick={onBegin}>
            Start the job
          </Button>
        </div>
      </div>
    </div>
  );
}
