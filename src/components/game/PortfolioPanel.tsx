import { useGame } from './GameContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ATTACKS, WEAKNESSES, DEFENSES } from '@/lib/data';
import { PHASES } from '@/lib/products';
import type { Product } from '@/lib/products';
import { GameSection } from './GameSection';
import { CiteLink } from './CiteLink';
import { urlForCitation } from '@/lib/sources';

export function PortfolioPanel() {
  const { game } = useGame();
  const upcoming = game.products.getUpcoming(game.turn);
  const all = [...game.products.getInPipeline(), ...game.products.getLiveProducts()];
  const tmr = game.getThreatModelReport();

  if (all.length === 0) return null;

  return (
    <GameSection title="Portfolio" help="systems">
      {game.reqMgmtLevel === 0 && (
        <p className="text-sm text-muted-foreground">
          Security requirements not in scope. Controls are ad hoc — unknown risks, or implemented incorrectly.
        </p>
      )}
      {tmr.level === 'none' ? (
        game.reqMgmtLevel > 0 && (
          <p className="text-sm text-muted-foreground">
            Threat-model these systems to assess which are at risk.
          </p>
        )
      ) : (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>{tmr.totalRisks - tmr.hiddenRisks}/{tmr.totalRisks} found</span>
          <span>Web/Infra: <strong className={tmr.owaspPct >= 80 ? 'text-emerald-300' : tmr.owaspPct >= 50 ? 'text-yellow-200' : 'text-red-300'}>{tmr.owaspPct}%</strong></span>
          <span>AI/LLM: <strong className={tmr.aiPct >= 80 ? 'text-emerald-300' : tmr.aiPct >= 50 ? 'text-yellow-200' : 'text-red-300'}>{tmr.aiPct}%</strong></span>
        </div>
      )}

      <ThreatStrip />

      {upcoming.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Coming: {upcoming.map(p => <span key={p.id}><strong>{p.icon} {p.name}</strong> ({game.getCalendarQuarter(p.arrivesTurn)}) </span>)}
        </div>
      )}
      {all.map(p => <ProductCard key={p.id} product={p} />)}
    </GameSection>
  );
}

function ThreatStrip() {
  const { game } = useGame();
  const hasTM = game.threatModelLevel > 0;
  const activeWeaknesses = new Set<string>();
  for (const p of game.products.getLiveProducts()) {
    for (const wk of p.weaknesses) activeWeaknesses.add(wk);
  }
  const relevant = ATTACKS
    .filter(a => a.exploits.some(wk => activeWeaknesses.has(wk)))
    .sort((a, b) => b.quarterlyProb - a.quarterlyProb)
    .slice(0, 5);
  if (relevant.length === 0) return null;

  return (
    <div className="space-y-1">
      {relevant.map(attack => {
        let status: 'unknown' | 'defended' | 'partial' | 'exposed' = 'unknown';
        if (hasTM) {
          const allDefended = attack.exploits.every(wk => {
            const vulnProducts = game.products.getVulnerableTo(wk);
            if (vulnProducts.length === 0) return true;
            return vulnProducts.every(p => game.getMitigationEffectiveness(wk, p) >= 0.5);
          });
          const anyDefense = attack.exploits.some(wk =>
            game.products.getLiveProducts().some(p => game.getMitigationEffectiveness(wk, p) > 0)
          );
          status = allDefended ? 'defended' : anyDefense ? 'partial' : 'exposed';
        }
        const dotColor = {
          unknown: 'bg-muted-foreground/40',
          defended: 'bg-emerald-400',
          partial: 'bg-yellow-300',
          exposed: 'bg-red-400',
        }[status];
        const statusWord = { unknown: 'Unassessed', defended: 'Defended', partial: 'Partial', exposed: 'Exposed' }[status];
        return (
          <div key={attack.name} className="flex items-center gap-2 py-0.5 text-xs text-muted-foreground">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} aria-hidden />
            <span className="font-medium text-foreground/80 flex-1 truncate">{attack.name}</span>
            <span className="shrink-0">{statusWord}</span>
            <span className="shrink-0">{attack.annualRate}</span>
            <CiteLink href={urlForCitation(attack.citation, attack.source)}>{attack.source}</CiteLink>
          </div>
        );
      })}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { game } = useGame();
  const visibleW = game.getVisibleWeaknesses(product);
  const hiddenW = game.getHiddenWeaknessCount(product);
  const hasAnyTool = game.threatModelLevel > 0;
  const estimate = game.getIndustryEstimate(product);
  const riskColors = { Low: 'text-emerald-300', Medium: 'text-yellow-200', High: 'text-brand', Critical: 'text-red-300' };

  return (
    <Card className={product.launched ? 'border-green-500/20' : 'border-l-2 border-l-yellow-500'}>
      <CardContent className="pt-3 pb-2 space-y-2">
        <div className="flex items-center gap-2">
          <span>{product.icon}</span>
          <span className="font-semibold text-base flex-1">{product.name}</span>
          {product.launched
            ? <Badge variant="outline" className="text-sm text-emerald-300 border-emerald-400/30">{PHASES[4]}</Badge>
            : <Badge variant="outline" className="text-sm text-yellow-200 border-yellow-400/30">{PHASES[product.phase]}</Badge>
          }
        </div>
        <div className="text-sm text-muted-foreground">{product.desc}</div>
        <ProductStageNote product={product} />

        {!hasAnyTool ? (
          <div className="flex items-center gap-2 bg-muted/20 rounded px-3 py-2 text-sm text-muted-foreground">
            <span>Risk: <strong className={riskColors[estimate.level]}>{estimate.level}</strong> (industry estimate, ~{estimate.count} gaps)</span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {product.mitigated.size}/{game.threatModelLevel >= 3 ? product.weaknesses.length : `${visibleW.length}+`} gaps addressed
              {hiddenW > 0 && <span className="text-yellow-200 ml-1">· {hiddenW} unidentified</span>}
            </div>
            {visibleW.map(wk => <WeaknessRow key={wk} product={product} wk={wk} />)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProductStageNote({ product }: { product: Product }) {
  const { game } = useGame();
  const compressed = product.launched && product.id === 'aifeature' && game.maxTurns <= 3;
  const until = product.launched ? 0 : Math.max(0, 4 - product.phase);

  if (product.launched) {
    return (
      <p className="text-sm text-muted-foreground">
        {compressed
          ? `Production this quarter (interim assignment). +$${product.revenue}K/q revenue.`
          : product.revenue > 0
            ? `Production. +$${product.revenue}K/q company revenue.`
            : 'Production. Can be attacked.'}
      </p>
    );
  }

  return (
    <p className="text-sm text-yellow-200">
      In {PHASES[product.phase].toLowerCase()}. Not attacked.
      {until > 0 ? ` ${until}q to production.` : ''}
      {product.revenue > 0 ? ` Then +$${product.revenue}K/q.` : ''}
    </p>
  );
}

function WeaknessRow({ product, wk }: { product: Product; wk: string }) {
  const { game, update } = useGame();
  const w = WEAKNESSES[wk];
  if (!w) return null;
  const mitigated = product.mitigated.has(wk);
  const effectiveness = game.getMitigationEffectiveness(wk);
  const bestPath = game.getBestMatchedPath(wk);

  if (mitigated) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-300/90 pl-1">
        <span>✅</span><span>{w.label}</span>
      </div>
    );
  }

  const status = effectiveness >= 0.5 ? 'partial' : 'exposed';

  return (
    <div className="rounded border border-border/50 px-2.5 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span>{status === 'exposed' ? '🚨' : '⚠️'}</span>
        <span className="font-medium">{w.label}</span>
        <span className={`text-sm ${status === 'partial' ? 'text-yellow-200' : 'text-red-300'}`}>
          {status === 'partial' ? 'partial' : 'exposed'}
        </span>
        <CiteLink href={w.sourceUrl || urlForCitation(w.citation, w.source)}>{w.source}</CiteLink>
      </div>

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
                className="flex items-center gap-1 text-sm text-brand hover:text-brand-hover disabled:opacity-40"
                disabled={game.getUpgradeCost(dk) === null || (game.getUpgradeCost(dk) || 0) > game.getAvailableBudget()}
                onClick={() => { game.queueUpgrade(dk); update(); }}
              >
                {def.icon} {def.name} Lv{current}→{minLevel} <span className="text-muted-foreground">${game.getUpgradeCost(dk)}K</span>
              </button>
            );
          })}
        </div>
      )}

      {bestPath?.met && game.reqMgmtLevel > 0 && (
        <div className="text-sm text-muted-foreground pl-5 mt-1">
          {game.getFixCapacity() > 0
            ? 'Staff will close this if a slot is free this quarter.'
            : 'Hire Security Staff — they close risks at the end of the quarter.'}
        </div>
      )}

      {game.reqMgmtLevel === 0 && !bestPath?.met && (
        <div className="text-sm text-muted-foreground pl-5 mt-1">No requirements yet — buy security requirements so staff can close this.</div>
      )}
    </div>
  );
}
