import { useGame } from './GameContext';
import { GameSection } from './GameSection';

export function GameOverScore() {
  const { game } = useGame();
  const b = game.getScoreBreakdown();
  const rows = [
    { label: 'Kept your badge', value: `+${b.survivalPts}`, hint: `${game.turn} quarters` },
    { label: 'Made Marcus richer', value: `+${b.valuationPts}`, hint: 'Company value' },
    { label: 'Avoided board execution', value: `+${b.reputationPts}`, hint: 'Trust' },
    { label: 'Bought useful things', value: `+${b.posturePts}`, hint: 'Posture' },
    { label: "Ruined attackers' day", value: `+${b.blockedPts}`, hint: 'Blocked', tone: 'text-emerald-600' },
    { label: 'Filled vendor quotas', value: `+${b.defensePts}`, hint: 'Controls' },
    { label: 'Actually read the risk register', value: `+${b.toolPts}`, hint: 'TM + requirements', tone: 'text-brand' },
    { label: 'Slept occasionally', value: `+${b.quietPts}`, hint: 'Quiet quarters', tone: 'text-emerald-600' },
    { label: 'Incident-response cardio', value: `-${b.breachPenalty}`, hint: 'Breaches', tone: 'text-red-600' },
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
