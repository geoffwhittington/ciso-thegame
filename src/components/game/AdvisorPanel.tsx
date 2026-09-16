import { useGame } from './GameContext';
import { Button } from '@/components/ui/button';
import { GameSection } from './GameSection';
import { CiteLink } from './CiteLink';

const LEVEL_LABELS: Record<string, string> = {
  blind: 'By industry frequency',
  aware: 'From your systems',
  guided: 'With team instructions',
  strategic: 'From assessment and instructions',
};

export function AdvisorPanel() {
  const { game, update } = useGame();
  const recs = game.getRecommendations();
  const level = game.getAdvisorLevel();
  const label = LEVEL_LABELS[level];

  if (recs.length === 0) return null;

  return (
    <GameSection title="Suggested spend" hint={label}>
      <p className="text-sm text-muted-foreground mb-2">
        {level === 'blind'
          ? 'Until you assess this system, these extras follow industry frequency.'
          : 'Live systems first. Pipeline only if production is covered.'}
      </p>
      <div className="space-y-2">
        {recs.slice(0, 3).map((rec, i) => {
          const canAfford = rec.cost <= game.getAvailableBudget();
          const isInfo = rec.actionType === 'info';
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg shrink-0">{rec.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{rec.title}</div>
                <div className="text-sm text-muted-foreground">
                  {rec.detail}
                  {rec.sourceUrl && rec.sourceLabel && (
                    <>
                      {' '}
                      <CiteLink href={rec.sourceUrl}>{rec.sourceLabel}</CiteLink>
                    </>
                  )}
                </div>
              </div>
              {!isInfo && rec.actionKey && (
                <Button
                  size="sm"
                  className="shrink-0 h-10 text-sm bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={!canAfford || (rec.actionType === 'upgrade' && game.getUpgradeCost(rec.actionKey!) === null)}
                  onClick={() => {
                    if (rec.actionType === 'upgrade') game.queueUpgrade(rec.actionKey!);
                    else if (rec.actionType === 'train') game.toggleTraining(rec.actionKey!);
                    update();
                  }}
                >
                  {rec.actionType === 'upgrade' && (game.pendingUpgrades[rec.actionKey!] || 0) > 0 ? 'Queued ✓' : `$${rec.cost}K`}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </GameSection>
  );
}
