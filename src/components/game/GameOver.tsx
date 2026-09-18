import { useState } from 'react';
import { useGame } from './GameContext';
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
    <div className="min-h-screen flex items-start justify-center p-4 sm:py-6">
      <div className="w-full max-w-3xl space-y-3 animate-in fade-in duration-500">
      <GameOverHero />

      <button className="comic-btn comic-btn-primary w-full text-lg" onClick={startOver}>
        🔄 Play again
      </button>

      <div className="comic-card p-4 space-y-3">
        {!saved ? (
          <div className="space-y-2">
            <p className="text-sm font-bold text-muted-foreground">Add your name to save this run.</p>
            <div className="flex gap-2">
              <Input
                className="flex-1 h-10 border-3 border-foreground/20 rounded-lg font-bold"
                placeholder="Your name"
                maxLength={20}
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button className="comic-btn comic-btn-secondary h-10" onClick={handleSave}>Save</button>
            </div>
          </div>
        ) : (
          <p className="text-emerald-600 font-black text-center text-sm comic-heading">✓ Saved on this device</p>
        )}

        {scores.length > 0 && (
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 comic-heading">🏆 Best on this device</h3>
            {scores.slice(0, 5).map((s, i) => (
              <div key={s.id} className={`flex gap-2 py-1.5 border-b-2 border-dashed border-border/20 last:border-0 text-sm min-w-0 ${i === 0 ? 'text-brand font-black' : ''}`}>
                <span className="w-5 shrink-0 text-muted-foreground font-black">{i + 1}</span>
                <span className="flex-1 min-w-0 truncate font-semibold">{s.name}</span>
                <span className="font-black tabular-nums shrink-0">{s.score.toLocaleString()}</span>
                <span className="shrink-0 w-8 text-right font-black comic-heading">{s.grade}</span>
                <span className="text-muted-foreground shrink-0 w-14 text-right font-bold">{s.valuation}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(v => !v)}
        className="w-full comic-btn comic-btn-secondary text-sm"
      >
        {showDetails ? 'Hide the details' : '📊 See what happened and how the grade was built'}
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
