import { useGame } from './GameContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WEAKNESSES, DEFENSES } from '@/lib/data';
import { PHASES } from '@/lib/products';
import type { Product } from '@/lib/products';
import { GameSection } from './GameSection';
import { CiteLink } from './CiteLink';
import { urlForCitation } from '@/lib/sources';

export function PortfolioPanel() {
  const { game } = useGame();
  const upcoming = game.products.getUpcoming(game.turn);
  const all = [...game.products.getInPipeline(), ...game.products.getLiveProducts()];

  if (all.length === 0) return null;

  return (
    <GameSection title="Your Systems" hint={`${all.length} system${all.length !== 1 ? 's' : ''}`}>
      {upcoming.length > 0 && (
        <div className="text-sm text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 rounded px-3 py-1.5">
          Coming: {upcoming.map(p => <span key={p.id}><strong>{p.icon} {p.name}</strong> ({game.getCalendarQuarter(p.arrivesTurn)}) </span>)}
        </div>
      )}
      {all.map(p => <ProductCard key={p.id} product={p} />)}
    </GameSection>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { game } = useGame();
  const visibleW = game.getVisibleWeaknesses(product);
  const hiddenW = game.getHiddenWeaknessCount(product);
  const hasAnyTool = game.threatModelLevel > 0;
  const estimate = game.getIndustryEstimate(product);
  const riskColors = { Low: 'text-green-400', Medium: 'text-yellow-400', High: 'text-orange-400', Critical: 'text-red-400' };

  return (
    <Card className={product.launched ? 'border-green-500/20' : 'border-l-2 border-l-yellow-500'}>
      <CardContent className="pt-3 pb-2 space-y-2">
        <div className="flex items-center gap-2">
          <span>{product.icon}</span>
          <span className="font-semibold text-base flex-1">{product.name}</span>
          {product.launched
            ? <Badge variant="outline" className="text-sm text-green-400 border-green-400/30">{product.revenue ? `+$${product.revenue}K/q` : 'Live'}</Badge>
            : <Badge variant="outline" className="text-sm text-yellow-400 border-yellow-400/30">{PHASES[product.phase]}</Badge>
          }
        </div>
        <div className="text-sm text-muted-foreground">{product.desc}</div>

        {!hasAnyTool ? (
          <div className="flex items-center gap-2 bg-muted/20 rounded px-3 py-2 text-sm text-muted-foreground">
            <span>🔒</span>
            <span>Risk: <strong className={riskColors[estimate.level]}>{estimate.level}</strong> (industry estimate, ~{estimate.count} gaps)</span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {product.mitigated.size}/{game.threatModelLevel >= 3 ? product.weaknesses.length : `${visibleW.length}+`} gaps addressed
              {hiddenW > 0 && <span className="text-yellow-500 ml-1">· {hiddenW} unidentified</span>}
            </div>
            {visibleW.map(wk => <WeaknessRow key={wk} product={product} wk={wk} />)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WeaknessRow({ product, wk }: { product: Product; wk: string }) {
  const { game, update } = useGame();
  const w = WEAKNESSES[wk];
  if (!w) return null;
  const mitigated = product.mitigated.has(wk);
  const queued = game.isMitigationQueued(product.id, wk);
  const hasRM = game.reqMgmtLevel > 0;
  const hours = game.getMitigationHours(wk);
  const canLand = hours <= game.getHoursRemaining();
  const effectiveness = game.getMitigationEffectiveness(wk);
  const bestPath = game.getBestMatchedPath(wk);

  if (mitigated) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400/80 pl-1">
        <span>✅</span><span>{w.label}</span>
      </div>
    );
  }

  const status = effectiveness >= 0.5 ? 'partial' : 'exposed';

  return (
    <div className={`rounded border px-2.5 py-2 text-sm ${queued ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-border/50'}`}>
      <div className="flex items-center gap-2">
        <span>{queued ? '🔶' : status === 'exposed' ? '🚨' : '⚠️'}</span>
        <span className="font-medium">{w.label}</span>
        <span className={`text-sm ${status === 'partial' ? 'text-yellow-400' : 'text-red-400'}`}>
          {status === 'partial' ? 'partial' : 'exposed'}
        </span>
        <CiteLink href={w.sourceUrl || urlForCitation(w.citation, w.source)}>{w.source}</CiteLink>
      </div>

      {/* Show next action — what the tools reveal */}
      {bestPath && !bestPath.met && (
        <div className="flex items-center gap-2 mt-1 pl-5 flex-wrap">
          {Object.entries(bestPath.requires).map(([dk, minLevel]) => {
            const current = game.getEffectiveDefenseLevel(dk);
            if (current >= minLevel) return null;
            const def = DEFENSES[dk];
            if (!def) return null;
            return (
              <button
                key={dk}
                className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 disabled:opacity-40"
                disabled={game.getUpgradeCost(dk) === null || (game.getUpgradeCost(dk) || 0) > game.getAvailableBudget()}
                onClick={() => { game.queueUpgrade(dk); update(); }}
              >
                {def.icon} {def.name} Lv{current}→{minLevel} <span className="text-muted-foreground">${game.getUpgradeCost(dk)}K</span>
              </button>
            );
          })}
        </div>
      )}

      {hasRM && bestPath?.met && !queued && (
        <div className="mt-1 pl-5 flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 text-sm" disabled={!canLand}
            onClick={() => { game.queueMitigation(product.id, wk); update(); }}>
            Implement controls {hours}h
          </Button>
          {!canLand && (
            <span className="text-sm text-red-400">
              {game.getChampionCount() === 0
                ? 'Hire a champion and a team of 4'
                : `Need ${hours}h. ${game.getHoursRemaining()}h left this quarter.`}
            </span>
          )}
        </div>
      )}

      {queued && (
        <div className="mt-1 pl-5">
          <Button variant="ghost" size="sm" className="h-10 text-sm text-red-400" onClick={() => { game.cancelMitigation(product.id, wk); update(); }}>Cancel</Button>
        </div>
      )}

      {!hasRM && !bestPath?.met && (
        <div className="text-sm text-muted-foreground pl-5 mt-1">No execution plan yet — requirements and training would turn this into a fix</div>
      )}
    </div>
  );
}
