import { useGame } from './GameContext';
import { AssumptionsHelp } from './AssumptionsHelp';
import { postureLabel, incidentSummary } from '@/lib/narrativeLabels';

export function Hud() {
  const { game, startOver } = useGame();
  const stance = postureLabel(game.securityPosture);
  const incidents = incidentSummary(game.totalBlocked, game.totalContained, game.totalBreaches);

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        <span className={`font-bold ${stance.tone}`}>🔒 {stance.text}</span>
        <span className={`font-bold ${incidents.tone}`}>⚡ {incidents.text}</span>
      </div>
      <div className="flex items-center gap-3">
        <AssumptionsHelp />
        <button type="button" className="text-muted-foreground hover:text-foreground font-semibold" onClick={startOver}>
          ← Start over
        </button>
      </div>
    </div>
  );
}
