import { useGame } from './GameContext';
import { Hud } from './Hud';
import { Button } from '@/components/ui/button';
import { GameSection } from './GameSection';
import { CiteLink } from './CiteLink';
import { urlForCitation, urlForSource } from '@/lib/sources';

export function Report() {
  const { game, update } = useGame();
  const entries = game.turnLog;
  const products = entries.filter(e => e.type === 'product_arrived' || e.type === 'product_launched');
  const milestones = entries.filter(e => e.type === 'milestone');
  const degradations = entries.filter(e => e.type === 'degradation');
  const news = entries.filter(e => e.type === 'news');
  const events = entries.filter(e => e.type === 'event');
  const attacks = entries.filter(e => e.type === 'attack');
  const trust = entries.filter(e => e.type === 'trust');
  const breached = attacks.filter(e => e.data.result === 'breach');
  const blocked = attacks.filter(e => e.data.result === 'blocked');
  const contained = attacks.filter(e => e.data.result === 'contained');

  const color = breached.length > 0 ? 'from-red-500/20' : contained.length > 0 ? 'from-yellow-500/20' : 'from-green-500/20';
  const label = breached.length > 0 ? '🔴 Breach' : contained.length > 0 ? '🟡 Contained' : '🟢 Secure';

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
      <Hud />

      <div className={`bg-gradient-to-r ${color} to-transparent rounded-xl px-4 py-3 flex items-center justify-between`}>
        <div>
          <h2 className="text-lg font-bold">{label}</h2>
          <span className="text-sm text-muted-foreground">{game.getCalendarQuarter()} Summary</span>
        </div>
        <div className="flex gap-4 text-center">
          <div><div className="text-xl font-bold text-green-400">{blocked.length}</div><div className="text-sm text-muted-foreground">Blocked</div></div>
          <div><div className="text-xl font-bold text-yellow-400">{contained.length}</div><div className="text-sm text-muted-foreground">Contained</div></div>
          <div><div className="text-xl font-bold text-red-400">{breached.length}</div><div className="text-sm text-muted-foreground">Breaches</div></div>
        </div>
      </div>

      {/* Everything in one card — scannable list */}
      {(milestones.length > 0 || products.length > 0 || degradations.length > 0 || events.length > 0 || trust.length > 0) && (
        <GameSection title="At NovaMind">
          <div className="space-y-2 text-sm">
            {trust.map((e, i) => (
              <div key={`t${i}`} className="text-green-400">💚 {e.data.text}</div>
            ))}
            {milestones.map((e, i) => (
              <div key={`m${i}`}>🏆 <strong>{e.data.name}</strong>{e.data.valuationBoost ? ` — +${e.data.valuationBoost}%` : ''}</div>
            ))}
            {products.map((e, i) => (
              <div key={`p${i}`}>
                {e.type === 'product_arrived' ? `🚀 ${e.data.icon} ${e.data.name} entered pipeline` : `🟢 ${e.data.icon} ${e.data.name} launched`}
              </div>
            ))}
            {degradations.map((e, i) => (
              <div key={`d${i}`} className="text-yellow-400">
                <div>{e.data.icon} {e.data.defense} had an operational setback — {e.data.text}</div>
                <div className="text-muted-foreground mt-0.5">
                  It worked one level weaker this quarter (effectiveness boost can drop). More Security Staff makes this less likely.
                </div>
              </div>
            ))}
            {events.map((e, i) => (
              <div key={`e${i}`}>{e.data.icon} {e.data.name}{e.data.outcome ? ` — ${e.data.outcome}` : ''}</div>
            ))}
          </div>
        </GameSection>
      )}

      {news.length > 0 && (
        <GameSection title="Industry news" hint="not your company">
          <div className="space-y-2 text-sm">
            {news.map((e, i) => (
              <div key={`n${i}`}>
                <span className="text-sm bg-orange-400/10 text-orange-400 px-1.5 py-0.5 rounded mr-1">{e.data.category}</span>
                {e.data.headline}
                {urlForSource(e.data.source) && (
                  <>
                    {' '}
                    <CiteLink href={urlForSource(e.data.source)!}>{e.data.source}</CiteLink>
                  </>
                )}
                {e.data.impact && <div className="text-yellow-400 mt-0.5 pl-1">{e.data.impact}</div>}
              </div>
            ))}
          </div>
        </GameSection>
      )}

      {attacks.length > 0 && (
        <GameSection title="Attacks this quarter">
          <div className="space-y-1.5">
            {attacks.map((e, i) => {
              const icon = e.data.result === 'blocked' ? '🟢' : e.data.result === 'contained' ? '🟡' : '🔴';
              const border = e.data.result === 'breach' ? 'border-red-500/30 bg-red-500/5' : 'border-border/30';
              return (
                <div key={i} className={`border ${border} rounded-lg px-3 py-2`}>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{icon}</span>
                    <strong className="flex-1">{e.data.name}</strong>
                    <span className="text-sm text-orange-400/80">{e.data.annualRate}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">{e.data.reason}</div>
                  {e.data.source && (
                    <div className="text-sm text-muted-foreground mt-0.5">
                      <CiteLink href={e.data.sourceUrl || urlForCitation(e.data.citation || '', e.data.source)}>
                        {e.data.source}
                      </CiteLink>
                      {e.data.citation ? ` (${e.data.citation})` : ''}
                    </div>
                  )}
                  {e.data.blindSpot && game.threatModelLevel === 0 && (
                    <div className="text-sm text-red-400 mt-1">Not anticipated — spend did not line up with this attack.</div>
                  )}
                </div>
              );
            })}
          </div>
        </GameSection>
      )}

      <div className="text-center text-sm text-muted-foreground">
        All-time: {game.totalBlocked} blocked · {game.totalContained} contained · {game.totalBreaches} breaches
        {game.blindSpotBreaches > 0 && ` · ${game.blindSpotBreaches} blind spots`}
      </div>

      <div className="text-center pt-2 pb-4">
        <Button size="lg" onClick={() => { game.nextTurn(); update(); }}>
          {game.reputation <= 0 || game.turn >= game.maxTurns ? 'See how you did →' : 'Next Quarter →'}
        </Button>
      </div>
    </div>
  );
}
