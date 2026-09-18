import { useGame } from './GameContext';
import { ReviewBlock } from './ReviewChrome';
import { CiteLink } from './CiteLink';
import { urlForSource } from '@/lib/sources';
import { AssumptionsHelp } from './AssumptionsHelp';
import { ReportIncidents } from './ReportIncidents';
import { ReportInternal } from './ReportInternal';
import { ReportRow } from './ReportRow';
import { PersonaMessage } from './PersonaMessage';
import { getLine } from '@/lib/personas';

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
  const fired = game.reputation <= 0;
  const done = fired || game.turn >= game.maxTurns;
  const internal = milestones.length + products.length + degradations.length + events.length + trust.length + fixes.length;

  const situation = fired ? 'gameover_lose' : breached.length > 0 ? 'quarter_breach' : contained.length > 0 ? 'quarter_contained' : 'quarter_calm';

  return (
    <div className="h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col comic-card overflow-hidden">
        <div className="shrink-0 px-4 pt-3 sm:px-5 sm:pt-4 paper-texture">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className={`text-xl sm:text-2xl font-black comic-heading ${fired ? 'text-red-600' : 'text-brand'}`}>
                {fired ? "You're Fired" : done ? 'Assignment Complete' : 'Quarter Review'}
              </h1>
              <p className="text-xs font-bold text-muted-foreground">{game.getCalendarQuarter()} · Q{game.turn}/{game.maxTurns}</p>
            </div>
            <button type="button" className="text-sm font-bold text-muted-foreground hover:text-foreground shrink-0" onClick={startOver}>← Back</button>
          </div>

          {/* Persona reactions instead of raw stat grid */}
          <PersonaMessage id="board" line={getLine('board', situation, game.turn)} compact />
          {breached.length > 0 && <PersonaMessage id="analyst" line={getLine('analyst', 'quarter_breach', game.turn)} compact />}
          {breached.length === 0 && blocked.length > 0 && <PersonaMessage id="analyst" line={getLine('analyst', situation, game.turn)} compact />}

          <div className="flex flex-wrap gap-2 mt-2 mb-1">
            {blocked.length > 0 && <span className="comic-badge comic-badge-green text-[9px]">🛡️ {blocked.length} stopped</span>}
            {contained.length > 0 && <span className="comic-badge comic-badge-yellow text-[9px]">⚠️ {contained.length} contained</span>}
            {breached.length > 0 && <span className="comic-badge comic-badge-red text-[9px]">🚨 {breached.length} breach{breached.length > 1 ? 'es' : ''}</span>}
            {attacks.length === 0 && <span className="comic-badge comic-badge-green text-[9px]">✨ No incidents</span>}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 pb-3 paper-texture">
          {attacks.length > 0 && (
            <ReviewBlock title="Incidents">
              <ReportIncidents attacks={attacks} />
            </ReviewBlock>
          )}

          {internal > 0 && (
            <ReviewBlock title="Internal">
              <ReportInternal trust={trust} fixes={fixes} milestones={milestones} products={products} degradations={degradations} events={events} />
            </ReviewBlock>
          )}

          {news.length > 0 && (
            <ReviewBlock title="Industry">
              <ul className="space-y-2">
                {news.map((e, i) => (
                  <ReportRow key={`n${i}`} mark="📰" title={`${e.data.category}: ${e.data.headline}`}>
                    {urlForSource(e.data.source) && <CiteLink href={urlForSource(e.data.source)!}>{e.data.source}</CiteLink>}
                    {e.data.impact && <div className="mt-0.5">{e.data.impact}</div>}
                  </ReportRow>
                ))}
              </ul>
            </ReviewBlock>
          )}
        </div>

        <div className="shrink-0 flex items-center justify-between gap-3 border-t-2 border-foreground/20 px-4 py-2.5 sm:px-5 bg-card">
          <AssumptionsHelp label="Sources" triggerClass="text-sm text-brand font-bold underline-offset-4 hover:underline" />
          <button className="comic-btn comic-btn-primary" onClick={() => { game.nextTurn(); update(); }}>
            {fired ? 'Clear your desk →' : done ? 'Results →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
