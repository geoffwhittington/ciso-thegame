import { useGame } from './GameContext';
import { ReviewBlock, ReviewStat } from './ReviewChrome';
import { Button } from '@/components/ui/button';
import { CiteLink } from './CiteLink';
import { urlForSource } from '@/lib/sources';
import { AssumptionsHelp } from './AssumptionsHelp';
import { ReportIncidents } from './ReportIncidents';
import { ReportInternal } from './ReportInternal';
import { ReportRow } from './ReportRow';

export function Report() {
  const { game, update, startOver } = useGame();
  const entries = game.turnLog;
  const products = entries.filter(e => e.type === 'product_arrived' || e.type === 'product_launched');
  const milestones = entries.filter(e => e.type === 'milestone');
  const degradations = entries.filter(e => e.type === 'degradation');
  const news = entries.filter(e => e.type === 'news');
  const events = entries.filter(e => e.type === 'event');
  const attacks = entries.filter(e => e.type === 'attack');
  const trust = entries.filter(e => e.type === 'trust');
  const fixes = entries.filter(e => e.type === 'fixes');
  const breached = attacks.filter(e => e.data.result === 'breach');
  const blocked = attacks.filter(e => e.data.result === 'blocked');
  const contained = attacks.filter(e => e.data.result === 'contained');
  const outcome = breached.length > 0 ? 'Breach' : contained.length > 0 ? 'Limited' : 'Clear';
  const done = game.reputation <= 0 || game.turn >= game.maxTurns;
  const internal = milestones.length + products.length + degradations.length + events.length + trust.length + fixes.length;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-xl border border-border bg-card p-6 sm:p-10 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {done ? 'Assignment complete' : 'Quarterly review'}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              {game.getCalendarQuarter()} · {game.getRoleLabel()}
              {done
                ? `. Last quarter of the ${game.getWinLabel()}.`
                : ` · Quarter ${game.turn} of ${game.maxTurns}`}
            </p>
          </div>
          <button type="button" className="text-lg text-muted-foreground hover:text-foreground shrink-0" onClick={startOver}>
            Return to start
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <ReviewStat k="Reputation" v={`${game.reputation}/100`} />
          <ReviewStat k="Grade" v={game.getGrade()} />
          <ReviewStat k="Reserves" v={`$${game.treasury}K`} />
          <ReviewStat
            k="This quarter"
            v={outcome}
            tone={outcome === 'Breach' ? 'breach' : outcome === 'Clear' ? 'clear' : outcome === 'Limited' ? 'limited' : undefined}
          />
        </div>
        <p className="text-lg text-muted-foreground mt-3">
          Prevented {blocked.length} · Limited {contained.length} · Breaches {breached.length}
        </p>

        <ReviewBlock title="Incidents">
          <ReportIncidents attacks={attacks} />
        </ReviewBlock>

        {internal > 0 && (
          <ReviewBlock title="Internal">
            <ReportInternal
              trust={trust}
              fixes={fixes}
              milestones={milestones}
              products={products}
              degradations={degradations}
              events={events}
            />
          </ReviewBlock>
        )}

        {news.length > 0 && (
          <ReviewBlock title="Industry">
            <ul className="space-y-3">
              {news.map((e, i) => (
                <ReportRow key={`n${i}`} mark="📰" title={`${e.data.category}: ${e.data.headline}`}>
                  {urlForSource(e.data.source) && (
                    <CiteLink href={urlForSource(e.data.source)!}>{e.data.source}</CiteLink>
                  )}
                  {e.data.impact && <div className="mt-1">{e.data.impact}</div>}
                </ReportRow>
              ))}
            </ul>
          </ReviewBlock>
        )}

        <p className="text-lg text-muted-foreground mt-6">
          Engagement: {game.totalBlocked} prevented · {game.totalContained} limited · {game.totalBreaches} breaches
        </p>

        <div className="flex items-center justify-between gap-4 mt-8">
          <AssumptionsHelp label="Research sources" triggerClass="text-lg text-brand underline-offset-4 hover:underline" />
          <Button size="lg" className="text-lg px-8" onClick={() => { game.nextTurn(); update(); }}>
            {done ? 'View results' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
