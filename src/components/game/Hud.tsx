import { useGame } from './GameContext';
import { AssumptionsHelp } from './AssumptionsHelp';
import { trustLabel, postureLabel, incidentSummary, trustMeterFill } from '@/lib/narrativeLabels';

function MiniMeter({ value, fill }: { value: number; fill: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted/40 mt-0.5 overflow-hidden">
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Hud() {
  const { game, startOver } = useGame();
  const rep = game.reputation;
  const trust = trustLabel(rep);
  const stance = postureLabel(game.securityPosture);
  const incidents = incidentSummary(game.totalBlocked, game.totalContained, game.totalBreaches);

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold ${trust.tone}`}>🏛️ {trust.text}</span>
          <div className="w-12 hidden sm:block"><MiniMeter value={rep} fill={trustMeterFill(rep)} /></div>
        </div>
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
