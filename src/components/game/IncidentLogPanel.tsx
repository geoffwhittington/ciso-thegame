import { useGame } from './GameContext';
import { GameSection } from './GameSection';

const RESULT_BADGE: Record<string, string> = {
  blocked: 'comic-badge-green',
  contained: 'comic-badge-yellow',
  breach: 'comic-badge-red',
};

export function IncidentLogPanel() {
  const { game } = useGame();
  const log = [...game.attackLog].reverse();

  return (
    <GameSection title="📋 Incident Log">
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="stat-card stat-card-green">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">🛡️ Blocked</div>
          <div className="text-xl font-black comic-heading mt-1">{game.totalBlocked}</div>
        </div>
        <div className="stat-card stat-card-yellow">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">⚠️ Contained</div>
          <div className="text-xl font-black comic-heading mt-1">{game.totalContained}</div>
        </div>
        <div className="stat-card stat-card-coral">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">🚨 Breaches</div>
          <div className="text-xl font-black comic-heading mt-1">{game.totalBreaches}</div>
        </div>
      </div>

      {game.totalAttackCost > 0 && (
        <div className="stat-card stat-card-coral mb-3">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">💸 Estimated Losses</div>
          <div className="text-xl font-black comic-heading mt-1">${game.getEstimatedBreachCost()}M</div>
        </div>
      )}

      {log.length === 0 ? (
        <p className="text-sm text-muted-foreground handwritten">No incidents recorded yet. End a quarter to see what happens.</p>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {log.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b-2 border-dashed border-foreground/10 text-sm">
              <span className="text-xs font-black tabular-nums text-muted-foreground shrink-0 w-12 comic-heading">
                Q{entry.turn}
              </span>
              <span className="font-bold flex-1 min-w-0 truncate">{entry.name}</span>
              <span className={`comic-badge ${RESULT_BADGE[entry.result]} text-[9px] shrink-0`}>
                {entry.result}
              </span>
              {(entry.lossK ?? 0) > 0 && (
                <span className="text-xs font-bold tabular-nums text-red-600 shrink-0">
                  −${Math.round(entry.lossK ?? 0)}K
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </GameSection>
  );
}
