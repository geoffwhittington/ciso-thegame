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
    <div className="h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="shrink-0 px-5 pt-4 sm:px-6 sm:pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {done ? 'Assignment complete' : 'Quarterly review'}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {game.getCalendarQuarter()} · {game.getRoleLabel()}
                {done
                  ? `. Last quarter of the ${game.getWinLabel()}.`
                  : ` · Quarter ${game.turn} of ${game.maxTurns}`}
              </p>
            </div>
            <button type="button" className="text-sm text-muted-foreground hover:text-foreground shrink-0" onClick={startOver}>
              Return to start
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            <ReviewStat k="Reputation" v={`${game.reputation}/100`} />
            <ReviewStat k="Grade" v={game.getGrade()} />
            <ReviewStat k="Reserves" v={`$${game.treasury}K`} />
            <ReviewStat
              k="This quarter"
              v={outcome}
              tone={outcome === 'Breach' ? 'breach' : outcome === 'Clear' ? 'clear' : outcome === 'Limited' ? 'limited' : undefined}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Prevented {blocked.length} · Limited {contained.length} · Breaches {breached.length}
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 pb-3">
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
              <ul className="space-y-2">
                {news.map((e, i) => (
                  <ReportRow key={`n${i}`} mark="📰" title={`${e.data.category}: ${e.data.headline}`}>
                    {urlForSource(e.data.source) && (
                      <CiteLink href={urlForSource(e.data.source)!}>{e.data.source}</CiteLink>
                    )}
                    {e.data.impact && <div className="mt-0.5">{e.data.impact}</div>}
                  </ReportRow>
                ))}
              </ul>
            </ReviewBlock>
          )}

          <p className="text-sm text-muted-foreground mt-3">
            Engagement: {game.totalBlocked} prevented · {game.totalContained} limited · {game.totalBreaches} breaches
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-between gap-3 border-t border-border bg-card px-5 py-3 sm:px-6">
          <AssumptionsHelp label="Research sources" triggerClass="text-sm text-brand underline-offset-4 hover:underline" />
          <Button onClick={() => { game.nextTurn(); update(); }}>
            {done ? 'View results' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
