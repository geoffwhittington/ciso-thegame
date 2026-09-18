import { useGame } from './GameContext';
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
    <GameSection title="📦 Portfolio" help="systems">
      {game.reqMgmtLevel === 0 && (
        <p className="text-sm text-muted-foreground handwritten">
          Security requirements not in scope. Controls are ad hoc — unknown risks, or implemented incorrectly.
        </p>
      )}
      {tmr.level === 'none' ? (
        game.reqMgmtLevel > 0 && (
          <p className="text-sm text-muted-foreground handwritten">
            Threat-model these systems to assess which are at risk.
          </p>
        )
      ) : (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="comic-badge comic-badge-blue">{tmr.totalRisks - tmr.hiddenRisks}/{tmr.totalRisks} found</span>
          <span className={`comic-badge ${tmr.owaspPct >= 80 ? 'comic-badge-green' : tmr.owaspPct >= 50 ? 'comic-badge-yellow' : 'comic-badge-red'}`}>
            Web/Infra: {tmr.owaspPct}%
          </span>
          <span className={`comic-badge ${tmr.aiPct >= 80 ? 'comic-badge-green' : tmr.aiPct >= 50 ? 'comic-badge-yellow' : 'comic-badge-red'}`}>
            AI/LLM: {tmr.aiPct}%
          </span>
        </div>
      )}
      {upcoming.length > 0 && (
        <div className="text-xs text-muted-foreground font-bold">
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
  const riskBadge: Record<string, string> = { Low: 'comic-badge-green', Medium: 'comic-badge-yellow', High: 'comic-badge-red', Critical: 'comic-badge-red' };

  return (
    <div className={`stat-card ${product.launched ? 'stat-card-green' : 'stat-card-yellow'}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{product.icon}</span>
        <span className="font-black text-base flex-1 comic-heading">{product.name}</span>
        {product.launched
          ? <span className="comic-badge comic-badge-green">{PHASES[4]}</span>
          : <span className="comic-badge comic-badge-yellow">{PHASES[product.phase]}</span>
        }
      </div>
      <div className="text-sm text-muted-foreground mt-1">{product.desc}</div>
      <ProductStageNote product={product} />

      {!hasAnyTool ? (
        <div className="flex items-center gap-2 mt-1 text-sm">
          <span>Risk: <span className={`comic-badge ${riskBadge[estimate.level]}`}>{estimate.level}</span></span>
          <span className="text-muted-foreground">(industry estimate, ~{estimate.count} gaps)</span>
        </div>
      ) : (
        <div className="space-y-1 mt-1">
          <div className="text-sm font-bold">
            {product.mitigated.size}/{game.threatModelLevel >= 3 ? product.weaknesses.length : `${visibleW.length}+`} gaps addressed
            {hiddenW > 0 && <span className="text-yellow-600 ml-1 font-bold">· {hiddenW} unidentified</span>}
          </div>
          {visibleW.map(wk => <WeaknessRow key={wk} product={product} wk={wk} />)}
        </div>
      )}
    </div>
  );
}

function ProductStageNote({ product }: { product: Product }) {
  const { game } = useGame();
  const compressed = product.launched && product.id === 'aifeature' && game.maxTurns <= 3;
  const until = product.launched ? 0 : Math.max(0, 4 - product.phase);

  if (product.launched) {
    return (
      <p className="text-sm text-muted-foreground handwritten">
        {compressed
          ? `Production this quarter (interim assignment). +$${product.revenue}K/q revenue.`
          : product.revenue > 0
            ? `Production. +$${product.revenue}K/q company revenue.`
            : 'Production. Can be attacked.'}
      </p>
    );
  }

  return (
    <p className="text-sm font-bold text-yellow-700 handwritten">
      In {PHASES[product.phase].toLowerCase()}. Not attacked.
      {until > 0 ? ` ${until}q to production.` : ''}
      {product.revenue > 0 ? ` Then +$${product.revenue}K/q.` : ''}
      {` Security received $${product.securityAllowanceK}K ${
        product.id === 'acq' ? 'integration' : 'launch readiness'
      } funding.`}
    </p>
  );
}

function GapIncidentRate({ wk }: { wk: string }) {
  const attack = ATTACKS
    .filter(a => a.exploits.includes(wk))
    .sort((a, b) => b.quarterlyProb - a.quarterlyProb)[0];
  const weakness = WEAKNESSES[wk];

  if (!attack) {
    return weakness ? (
      <CiteLink
        href={weakness.sourceUrl || urlForCitation(weakness.citation, weakness.source)}
        title={`${weakness.source}: ${weakness.citation}`}
        ariaLabel={`Source: ${weakness.source}, ${weakness.citation}`}
        className="font-bold no-underline"
      >
        ↗
      </CiteLink>
    ) : null;
  }

  return (
    <span className="text-xs text-muted-foreground ml-auto" title={`Most likely incident: ${attack.name}`}>
      <span className="hidden sm:inline">{attack.name} · </span>
      <strong>{attack.annualRate}</strong>{' '}
      <CiteLink
        href={urlForCitation(attack.citation, attack.source)}
        title={`${attack.source}: ${attack.citation}`}
        ariaLabel={`Source for ${attack.annualRate}: ${attack.source}, ${attack.citation}`}
        className="font-bold no-underline"
      >
        ↗
      </CiteLink>
    </span>
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
      <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 pl-1 flex-wrap">
        <span>✅</span><span>{w.label}</span>
        <GapIncidentRate wk={wk} />
      </div>
    );
  }

  const status = effectiveness >= 0.5 ? 'partial' : 'exposed';

  return (
    <div className="rounded-lg border-2 border-foreground/15 px-2.5 py-2 text-sm bg-card/50">
      <div className="flex items-center gap-2 flex-wrap">
        <span>{status === 'exposed' ? '🚨' : '⚠️'}</span>
        <span className="font-bold">{w.label}</span>
        <span className={`comic-badge text-[10px] ${status === 'partial' ? 'comic-badge-yellow' : 'comic-badge-red'}`}>
          {status}
        </span>
        <GapIncidentRate wk={wk} />
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
                className="comic-btn comic-btn-action text-xs py-1 px-2 disabled:opacity-40"
                disabled={game.getUpgradeCost(dk) === null || (game.getUpgradeCost(dk) || 0) > game.getAvailableBudget()}
                onClick={() => { game.queueUpgrade(dk); update(); }}
              >
                {def.icon} {def.name} Lv{current}→{minLevel} · ${game.getUpgradeCost(dk)}K
              </button>
            );
          })}
        </div>
      )}

      {bestPath?.met && game.reqMgmtLevel > 0 && (
        <div className="text-sm text-muted-foreground pl-5 mt-1 handwritten">
          {game.getFixCapacity() > 0
            ? 'Staff will address this this quarter if they have capacity.'
            : 'Hire Security Staff — they close risks at the end of the quarter.'}
        </div>
      )}

      {game.reqMgmtLevel === 0 && !bestPath?.met && (
        <div className="text-sm text-muted-foreground pl-5 mt-1 handwritten">No requirements yet — buy security requirements so staff can close this.</div>
      )}
    </div>
  );
}
