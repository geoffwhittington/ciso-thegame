import { useGame } from './GameContext';
import { GameSection } from './GameSection';
import { CiteLink } from './CiteLink';
import { PersonaMessageInline } from './PersonaMessage';
import { getLine } from '@/lib/personas';

export function AdvisorPanel() {
  const { game, update } = useGame();
  const recs = game.getRecommendations();
  if (recs.length === 0) return null;

  const situation = game.threatModelLevel === 0 ? 'no_threat_model' : game.getAvailableBudget() < 100 ? 'budget_tight' : 'quarter_calm';
  const quip = getLine('analyst', situation, game.getDialogueSeed());

  return (
    <GameSection title="🧠 Advice" quiet>
      <PersonaMessageInline id="analyst" line={quip} />
      <div className="space-y-2 mt-1">
        {recs.slice(0, 3).map((rec, i) => {
          const canAfford = rec.cost <= game.getAvailableBudget();
          const isInfo = rec.actionType === 'info';
          return (
            <div key={i} className="py-2 border-b border-dashed border-foreground/10 last:border-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold leading-tight flex-1 min-w-0">{rec.title}</div>
                {!isInfo && rec.actionKey && (
                  <button
                    className="comic-btn comic-btn-action text-xs shrink-0 py-1 px-2 disabled:opacity-40"
                    disabled={!canAfford || (rec.actionType === 'upgrade' && game.getUpgradeCost(rec.actionKey!) === null)}
                    onClick={() => { if (rec.actionType === 'upgrade') game.queueUpgrade(rec.actionKey!); update(); }}
                  >
                    {(game.pendingUpgrades[rec.actionKey!] || 0) > 0 ? 'Queued ✓' : `$${rec.cost}K`}
                  </button>
                )}
              </div>
              <div className="text-xs text-muted-foreground leading-snug mt-1">
                {rec.detail}
                {rec.sourceUrl && rec.sourceLabel && (
                  <> <CiteLink href={rec.sourceUrl}>{rec.sourceLabel}</CiteLink></>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GameSection>
  );
}
