import { useGame } from './GameContext';
import { HudSpend } from './HudSpend';
import { GameSection } from './GameSection';
import { AssumptionsHelp } from './AssumptionsHelp';

function Meter({ value, fill, label }: { value: number; fill: string; label: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full rounded-full bg-muted mt-1.5 overflow-hidden" role="meter" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${fill} transition-[width] duration-700 ease-out motion-reduce:transition-none`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function reputationFill(n: number) {
  if (n < 30) return 'bg-red-400';
  if (n < 50) return 'bg-yellow-300';
  return 'bg-emerald-400';
}

function reputationCopy(n: number) {
  if (n < 30) return { tone: 'text-red-300', label: 'Critical' };
  if (n < 50) return { tone: 'text-yellow-200', label: 'Watch' };
  return { tone: 'text-emerald-300', label: 'Stable' };
}

export function Hud() {
  const { game, startOver } = useGame();
  const grade = game.getGrade();
  const progress = (game.turn / game.maxTurns) * 100;
  const rep = game.reputation;
  const { tone, label } = reputationCopy(rep);

  return (
    <div className="space-y-2">
      <div className="flex justify-end gap-4">
        <AssumptionsHelp />
        <button type="button" className="text-sm text-muted-foreground hover:text-foreground" onClick={startOver}>
          Return to start
        </button>
      </div>
      <GameSection title="Board status" help="status" quiet>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-lg px-3 py-2.5">
          <div className="text-sm text-muted-foreground">Quarter</div>
          <div className="text-lg sm:text-xl font-bold tabular-nums">{game.getCalendarQuarter()}</div>
          <Meter value={progress} fill="bg-foreground/50" label="Progress through the engagement" />
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2.5">
          <div className="text-sm text-muted-foreground">Reputation</div>
          <div className={`text-lg sm:text-xl font-bold tabular-nums ${tone}`}>{rep}/100 <span className="text-sm font-semibold">{label}</span></div>
          <Meter value={rep} fill={reputationFill(rep)} label={`Reputation ${label}`} />
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2.5">
          <div className="text-sm text-muted-foreground">Grade</div>
          <div className="text-xl sm:text-2xl font-black text-muted-foreground leading-tight">{grade}</div>
          <div className="text-sm text-muted-foreground mt-1">Score {game.getScore().toLocaleString()}</div>
          {game.quietStreak > 0 && <div className="text-sm text-emerald-300">{game.quietStreak} quiet quarter{game.quietStreak === 1 ? '' : 's'}</div>}
        </div>
      </div>
      </GameSection>
      <HudSpend />
    </div>
  );
}
