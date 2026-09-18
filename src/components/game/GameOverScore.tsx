import { useGame } from './GameContext';
import { GameSection } from './GameSection';

export function GameOverScore() {
  const { game } = useGame();
  const b = game.getScoreBreakdown();
  const rows = [
    { label: 'Survived', value: `+${b.survivalPts}`, hint: `${game.turn}q` },
    { label: 'Company value', value: `+${b.valuationPts}` },
    { label: 'Trust', value: `+${b.reputationPts}` },
    { label: 'Posture', value: `+${b.posturePts}` },
    { label: 'Attacks stopped', value: `+${b.blockedPts}`, tone: 'text-emerald-600' },
    { label: 'Controls', value: `+${b.defensePts}` },
    { label: 'TM + requirements', value: `+${b.toolPts}`, tone: 'text-brand' },
    { label: 'Quiet quarters', value: `+${b.quietPts}`, tone: 'text-emerald-600' },
    { label: 'Breaches', value: `-${b.breachPenalty}`, tone: 'text-red-600' },
  ];

  return (
    <GameSection title="Score breakdown" quiet>
      <div className="space-y-1 text-sm">
        {rows.map(row => (
          <div key={row.label} className="flex items-baseline gap-2">
            <span className="flex-1 text-muted-foreground">{row.label}</span>
            {row.hint && <span className="text-xs text-muted-foreground">{row.hint}</span>}
            <span className={`w-14 text-right font-bold tabular-nums ${row.tone || ''}`}>{row.value}</span>
          </div>
        ))}
        <div className="flex items-baseline gap-2 pt-1.5 border-t-2 border-dashed border-foreground/10 font-black">
          <span className="flex-1">Total</span>
          <span className="tabular-nums">{b.total.toLocaleString()} · {game.getGrade()}</span>
        </div>
      </div>
    </GameSection>
  );
}
