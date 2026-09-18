import { useState } from 'react';
import { ATTACKS, WEAKNESSES, DEFENSES } from '@/lib/data';
import { PHASES, type Product } from '@/lib/products';
import { urlForCitation } from '@/lib/sources';
import { CiteLink } from './CiteLink';
import { useGame } from './GameContext';

export function PortfolioProductCard({ product }: { product: Product }) {
  const { game } = useGame();
  const [open, setOpen] = useState(false);
  const visible = game.getVisibleWeaknesses(product);
  const hidden = game.getHiddenWeaknessCount(product);
  const unresolved = visible.filter(wk => !product.mitigated.has(wk));
  const exposed = unresolved.filter(wk => game.getMitigationEffectiveness(wk, product) < 0.5).length;
  const partial = unresolved.length - exposed;
  const estimate = game.getIndustryEstimate(product);

  return (
    <article className={`stat-card ${product.launched ? 'stat-card-green' : 'stat-card-yellow'}`}>
      <button
        type="button"
        className="w-full text-left flex items-center gap-2"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span className="text-lg">{product.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-base comic-heading">{product.name}</span>
            <span className={`comic-badge ${product.launched ? 'comic-badge-green' : 'comic-badge-yellow'}`}>
              {product.launched ? PHASES[4] : PHASES[product.phase]}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {game.threatModelLevel === 0
              ? `${estimate.level} estimated risk · about ${estimate.count} gaps`
              : `${product.mitigated.size}/${visible.length}${hidden > 0 ? '+' : ''} gaps addressed`
            }
            {exposed > 0 && <span className="text-red-600 font-bold"> · {exposed} exposed</span>}
            {partial > 0 && <span className="text-yellow-700 font-bold"> · {partial} partial</span>}
            {hidden > 0 && <span> · {hidden} unidentified</span>}
          </div>
        </div>
        <span className={`text-sm text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="mt-2 pt-2 border-t-2 border-foreground/10">
          <p className="text-sm text-muted-foreground">{product.desc}</p>
          <ProductStageNote product={product} />

          {game.threatModelLevel === 0 ? (
            <p className="text-sm mt-2">
              Industry estimate: <strong>{estimate.level}</strong>, about {estimate.count} gaps.
            </p>
          ) : (
            <div className="space-y-1 mt-2">
              {visible.map(wk => <WeaknessRow key={wk} product={product} wk={wk} />)}
            </div>
          )}
        </div>
      )}
    </article>
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
          ? `Production this quarter. +$${product.revenue}K/q revenue.`
          : product.revenue > 0
            ? `Production. +$${product.revenue}K/q revenue.`
            : 'Production. Can be attacked.'}
      </p>
    );
  }

  return (
    <p className="text-sm font-bold text-yellow-700 handwritten">
      Not attacked yet. {until}q to production.
      {product.revenue > 0 ? ` Then +$${product.revenue}K/q.` : ''}
      {` Security received $${product.securityAllowanceK}K ${
        product.id === 'acq' ? 'integration' : 'launch readiness'
      } funding.`}
    </p>
  );
}

function GapIncidentRate({ wk }: { wk: string }) {
  const attack = ATTACKS
    .filter(item => item.exploits.includes(wk))
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
  const weakness = WEAKNESSES[wk];
  if (!weakness) return null;

  const mitigated = product.mitigated.has(wk);
  const effectiveness = game.getMitigationEffectiveness(wk, product);
  const bestPath = game.getBestMatchedPath(wk);

  if (mitigated) {
    return (
      <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 pl-1 flex-wrap">
        <span>✓</span><span>{weakness.label}</span><GapIncidentRate wk={wk} />
      </div>
    );
  }

  const partial = effectiveness >= 0.5;
  return (
    <div className="rounded-lg border-2 border-foreground/15 px-2.5 py-2 text-sm bg-card/50">
      <div className="flex items-center gap-2 flex-wrap">
        <span>{partial ? '⚠' : '!'}</span>
        <span className="font-bold">{weakness.label}</span>
        <span className={`comic-badge ${partial ? 'comic-badge-yellow' : 'comic-badge-red'}`}>
          {partial ? 'Partial' : 'Exposed'}
        </span>
        <GapIncidentRate wk={wk} />
      </div>

      {bestPath && !bestPath.met && (
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {Object.entries(bestPath.requires).map(([key, minLevel]) => {
            const current = game.getEffectiveDefenseLevel(key);
            if (current >= minLevel) return null;
            const defense = DEFENSES[key];
            if (!defense) return null;
            return (
              <button
                key={key}
                className="comic-btn comic-btn-action text-xs py-1 px-2 disabled:opacity-40"
                disabled={game.getUpgradeCost(key) === null || (game.getUpgradeCost(key) || 0) > game.getAvailableBudget()}
                onClick={() => { game.queueUpgrade(key); update(); }}
              >
                {defense.name} Lv{current}→{minLevel} · ${game.getUpgradeCost(key)}K
              </button>
            );
          })}
        </div>
      )}

      {bestPath?.met && game.reqMgmtLevel > 0 && (
        <p className="text-sm text-muted-foreground mt-1 handwritten">
          {game.getFixCapacity() > 0
            ? 'Staff will address this this quarter if they have capacity.'
            : 'Hire Security Staff to address this.'}
        </p>
      )}

      {game.reqMgmtLevel === 0 && !bestPath?.met && (
        <p className="text-sm text-muted-foreground mt-1 handwritten">
          Buy security requirements so staff can address this.
        </p>
      )}
    </div>
  );
}
