import { useGame } from './GameContext';
import { HudSpend } from './HudSpend';

function Meter({ value, fill }: { value: number; fill: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full rounded-full bg-muted mt-1.5 overflow-hidden" role="meter" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function reputationFill(n: number) {
  if (n < 30) return 'bg-red-400';
  if (n < 50) return 'bg-yellow-400';
  return 'bg-green-400';
}

export function Hud() {
  const { game, startOver } = useGame();
  const grade = game.getGrade();
  const progress = (game.turn / game.maxTurns) * 100;
  const rep = game.reputation;

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button type="button" className="text-sm text-muted-foreground hover:text-foreground" onClick={startOver}>
          Start over
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-lg px-3 py-2.5">
          <div className="text-sm text-muted-foreground">Quarter</div>
          <div className="text-lg sm:text-xl font-bold tabular-nums">{game.getCalendarQuarter()}</div>
          <Meter value={progress} fill="bg-foreground/50" />
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2.5">
          <div className="text-sm text-muted-foreground">Reputation</div>
          <div className={`text-lg sm:text-xl font-bold tabular-nums ${rep < 30 ? 'text-red-400' : rep < 50 ? 'text-yellow-400' : 'text-green-400'}`}>{rep}</div>
          <Meter value={rep} fill={reputationFill(rep)} />
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2.5">
          <div className="text-sm text-muted-foreground">Grade</div>
          <div className="text-2xl sm:text-3xl font-black text-orange-400 leading-tight">{grade}</div>
          <div className="text-sm text-muted-foreground mt-1">Score {game.getScore().toLocaleString()}</div>
          {game.quietStreak > 0 && <div className="text-sm text-green-400">{game.quietStreak} quiet qtr</div>}
        </div>
      </div>
      <HudSpend />
    </div>
  );
}
