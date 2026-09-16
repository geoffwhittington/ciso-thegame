import { useGame } from './GameContext';
import { GameSection } from './GameSection';

export function GameOverScore() {
  const { game } = useGame();
  const b = game.getScoreBreakdown();
  const rows = [
    { label: 'Still CISO', value: `+${b.survivalPts}`, hint: `${game.turn} quarters` },
    { label: 'Company value', value: `+${b.valuationPts}`, hint: `$${(game.companyValue / 1000).toFixed(0)}M` },
    { label: 'Reputation', value: `+${b.reputationPts}`, hint: `${game.reputation}/100` },
    { label: 'Defense posture', value: `+${b.posturePts}`, hint: `${game.securityPosture}%` },
    { label: 'Attacks stopped', value: `+${b.blockedPts}`, hint: `${game.totalBlocked} blocked`, tone: 'text-emerald-300' },
    { label: 'Controls bought', value: `+${b.defensePts}` },
    { label: 'Anticipate and execute', value: `+${b.toolPts}`, hint: 'Risk assessment + guidance', tone: 'text-brand' },
    { label: 'Quiet quarters', value: `+${b.quietPts}`, hint: `${game.quietBonus} pts from calm quarters`, tone: 'text-emerald-300' },
    { label: 'Breaches', value: `-${b.breachPenalty}`, hint: `${game.totalBreaches}`, tone: 'text-red-300' },
  ];

  return (
    <GameSection title="How the grade was built" hint={`${b.total.toLocaleString()} pts · ${game.getGrade()}`}>
      <div className="space-y-1.5 text-sm">
        {rows.map(row => (
          <div key={row.label} className="flex items-baseline gap-3">
            <span className="flex-1">{row.label}</span>
            {row.hint && <span className="text-muted-foreground text-sm">{row.hint}</span>}
            <span className={`w-16 text-right font-bold tabular-nums ${row.tone || ''}`}>{row.value}</span>
          </div>
        ))}
        <div className="flex items-baseline gap-3 pt-2 border-t border-border font-bold">
          <span className="flex-1">Total</span>
          <span className="tabular-nums">{b.total.toLocaleString()}</span>
        </div>
      </div>
    </GameSection>
  );
}
