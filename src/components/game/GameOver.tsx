import { useState } from 'react';
import { useGame } from './GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GameOverHero } from './GameOverHero';
import { GameOverScore } from './GameOverScore';
import { GameOverTakeaway } from './GameOverTakeaway';
import { saveScore, getScores } from '@/lib/leaderboard';

export function GameOver() {
  const { game, startOver } = useGame();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const breakdown = game.getScoreBreakdown();
  const grade = game.getGrade();
  const bs = game.getBlindSpotSummary();
  const scores = getScores();

  const handleSave = () => {
    saveScore({
      name: name || 'Anonymous', score: breakdown.total, grade, turns: game.turn,
      breaches: game.totalBreaches, valuation: `$${(game.companyValue / 1000).toFixed(0)}M`,
      blindSpots: bs.blindSpotBreaches,
      degradationEvents: bs.totalDegradationEvents, estimatedBreachCost: game.getEstimatedBreachCost(),
      threatModelTurn: game.deploymentTurns.threatModel || 0,
      reqMgmtTurn: game.deploymentTurns.reqMgmt || 0,
    });
    setSaved(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl max-h-[94vh] overflow-y-auto space-y-3 animate-in fade-in duration-500">
      <GameOverHero />

      <Button className="w-full h-12 text-base font-semibold" onClick={startOver}>
        Play again
      </Button>

      <div className="rounded-xl border border-border bg-card px-4 py-3 space-y-3">
        {!saved ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Add your name to save this run.</p>
            <div className="flex gap-2">
              <Input
                className="flex-1 h-10"
                placeholder="Your name"
                maxLength={20}
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <Button variant="secondary" className="h-10" onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <p className="text-emerald-300 font-semibold text-center text-sm">✓ Saved on this device</p>
        )}

        {scores.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Best on this device</h3>
            {scores.slice(0, 5).map((s, i) => (
              <div key={s.id} className={`flex gap-2 py-1.5 border-b border-border last:border-0 text-sm min-w-0 ${i === 0 ? 'text-yellow-200 font-semibold' : ''}`}>
                <span className="w-5 shrink-0 text-muted-foreground">{i + 1}</span>
                <span className="flex-1 min-w-0 truncate">{s.name}</span>
                <span className="font-bold tabular-nums shrink-0">{s.score.toLocaleString()}</span>
                <span className="shrink-0 w-8 text-right">{s.grade}</span>
                <span className="text-muted-foreground shrink-0 w-14 text-right">{s.valuation}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(v => !v)}
        className="w-full text-sm font-medium text-muted-foreground hover:text-foreground py-1 transition-colors"
      >
        {showDetails ? 'Hide the details' : 'See what happened and how the grade was built'}
      </button>

      {showDetails && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <GameOverTakeaway />
          <GameOverScore />
        </div>
      )}
      </div>
    </div>
  );
}
