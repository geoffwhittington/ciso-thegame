import { useGame } from './GameContext';
import { GameSection } from './GameSection';
import { PortfolioProductCard } from './PortfolioProductCard';

export function PortfolioPanel() {
  const { game } = useGame();
  const upcoming = game.products.getUpcoming(game.turn);
  const all = [...game.products.getLiveProducts(), ...game.products.getInPipeline()];
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
      <div className="space-y-2">
        {all.map(product => <PortfolioProductCard key={product.id} product={product} />)}
      </div>
    </GameSection>
  );
}
