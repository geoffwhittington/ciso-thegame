import { useGame } from './GameContext';
import { UNUSED_CARRY_PCT, budgetRate } from '@/lib/simKnobs';
import { ReportRow } from './ReportRow';
import { ReviewBlock, ReviewStat } from './ReviewChrome';
import { PersonaMessage } from './PersonaMessage';
import { getLine } from '@/lib/personas';

export function Briefing({ onBegin }: { onBegin: () => void }) {
  const { game, startOver } = useGame();
  const carryPct = Math.round(UNUSED_CARRY_PCT * 100);
  const live = game.products.getLiveProducts();

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto comic-card p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-black comic-heading text-brand">Your First Day</h1>
          <button type="button" className="text-sm font-bold text-muted-foreground hover:text-foreground shrink-0" onClick={startOver}>← Back</button>
        </div>

        <PersonaMessage id="ceo" line={getLine('ceo', 'greeting', game.turn)} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <ReviewStat k="Company" v={`$${(game.companyValue / 1000).toFixed(0)}M`} />
          <ReviewStat k="Revenue/q" v={`$${(game.revenue / 1000).toFixed(0)}M`} />
          <ReviewStat k="Trust" v={`${game.reputation}/100`} />
          <ReviewStat k="Budget" v={`$${game.quarterlyBudget}K`} />
        </div>

        <ReviewBlock title="Your money">
          <p className="text-sm text-muted-foreground leading-relaxed handwritten">
            ${game.quarterlyBudget}K this quarter. Keep tools running, buy new ones.
            Trust goes up? Budget goes up. Get hacked? It goes down.
            Keep at most {carryPct}% of leftovers.
          </p>
        </ReviewBlock>

        <ReviewBlock title="Portfolio">
          <ul className="space-y-2">
            {live.map(p => (
              <ReportRow key={p.id} mark={p.icon} title={p.name}>Live. {p.desc}</ReportRow>
            ))}
          </ul>
        </ReviewBlock>

        <ReviewBlock title="Your job">
          <p className="text-sm text-muted-foreground leading-relaxed handwritten">
            {game.maxTurns} quarters. Keep board trust above 0. If it hits 0, you're out.
          </p>
        </ReviewBlock>

        <PersonaMessage id="ciso" line={getLine('ciso', 'greeting', game.turn)} compact />

        <div className="flex justify-end mt-4">
          <button onClick={onBegin} className="comic-btn comic-btn-primary text-lg">Start the job →</button>
        </div>
      </div>
    </div>
  );
}
