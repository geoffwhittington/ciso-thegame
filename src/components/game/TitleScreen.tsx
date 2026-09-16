import { Button } from '@/components/ui/button';
import { getScores } from '@/lib/leaderboard';
import { AssumptionsHelp } from './AssumptionsHelp';

export function TitleScreen({ onStart }: { onStart: (turns: number) => void }) {
  const scores = getScores();
  return (
    <div className="max-w-2xl mx-auto text-center py-20 px-4">
      <div className="text-6xl mb-4">🛡️</div>
      <h1 className="text-5xl font-black tracking-wider text-brand mb-2">CISO</h1>
      <p className="text-lg text-muted-foreground mb-2">Survive the Board. Outsmart the Breach.</p>
      <p className="text-base text-muted-foreground mb-2">by Security Compass</p>
      <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-md mx-auto">
        Assume the CISO role at a growth-stage AI company.
        Incident rates are drawn from published industry data.
        Allocate budget each quarter; staff address a limited number of listed gaps when the quarter closes.
      </p>
      <p className="mb-8"><AssumptionsHelp /></p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" className="text-lg px-8 py-6 h-auto flex-col gap-0.5" onClick={() => onStart(3)}>
          <span>Interim CISO</span>
          <span className="text-sm font-medium opacity-80">3 quarters</span>
        </Button>
        <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto flex-col gap-0.5" onClick={() => onStart(8)}>
          <span>Series B CISO</span>
          <span className="text-sm font-medium opacity-80">8 quarters</span>
        </Button>
        <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto flex-col gap-0.5" onClick={() => onStart(20)}>
          <span>IPO-path CISO</span>
          <span className="text-sm font-medium opacity-80">20 quarters</span>
        </Button>
      </div>
      <p className="mt-6">
        <a href="#lab" className="text-sm text-brand underline-offset-4 hover:underline">Simulation Lab</a>
        <span className="text-sm text-muted-foreground"> — Compare spending patterns</span>
      </p>
      {scores.length > 0 && (
        <div className="mt-12 text-left">
          <h3 className="text-base font-semibold text-brand mb-3">Leaderboard</h3>
          <div className="text-sm">
            {scores.slice(0, 5).map((s, i) => (
              <div key={s.id} className="flex gap-4 py-1.5 border-b border-border">
                <span className="w-6 text-muted-foreground">{i + 1}</span>
                <span className="flex-1">{s.name}</span>
                <span className="font-bold">{s.score.toLocaleString()}</span>
                <span className="text-muted-foreground">{s.grade}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
