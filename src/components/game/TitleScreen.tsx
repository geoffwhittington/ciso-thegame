import { getScores } from '@/lib/leaderboard';
import { AssumptionsHelp } from './AssumptionsHelp';
import { enterStyle } from './motion';

const MODES = [
  { turns: 3, label: 'Interim CISO', quarters: '3 quarters', blurb: 'A short tour. Learn the ropes fast.' },
  { turns: 8, label: 'Series B CISO', quarters: '8 quarters', blurb: 'Scale threat modeling and security requirements as the company grows.' },
  { turns: 20, label: 'IPO-path CISO', quarters: '20 quarters', blurb: 'The long game. Survive to the public markets.' },
] as const;

function ModeCard({ mode, primary, i, onStart }: {
  mode: (typeof MODES)[number];
  primary: boolean;
  i: number;
  onStart: (turns: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onStart(mode.turns)}
      style={enterStyle(i)}
      className={`ciso-enter group text-left rounded-xl border p-4 transition-all hover:-translate-y-0.5 ${
        primary
          ? 'border-brand bg-brand/10 hover:bg-brand/15'
          : 'border-border bg-muted/40 hover:border-foreground/25 hover:bg-muted'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold leading-tight">{mode.label}</span>
        {primary && (
          <span className="text-[10px] uppercase tracking-wide font-semibold text-brand bg-brand/15 rounded-full px-2 py-0.5 shrink-0">
            Start here
          </span>
        )}
      </div>
      <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mt-1">{mode.quarters}</div>
      <p className="text-sm text-muted-foreground mt-2 leading-snug">{mode.blurb}</p>
    </button>
  );
}

export function TitleScreen({ onStart }: { onStart: (turns: number) => void }) {
  const scores = getScores();
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <div className="ciso-enter relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="h-1.5 bg-brand" />
        <div className="px-6 sm:px-10 pt-9 pb-8 text-center">
          <div className="text-5xl mb-3" aria-hidden>🛡️</div>
          <h1 className="text-5xl font-black tracking-wider text-brand">CISO</h1>
          <p className="text-lg mt-2">Survive the Board. Outsmart the Breach.</p>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2">Acme Security Company</p>

          <p className="text-[15px] text-muted-foreground leading-relaxed mt-6 max-w-md mx-auto">
            Assume the CISO role at a growth-stage company. Incident rates are drawn from
            published industry data. Allocate budget each quarter; staff address a limited number
            of listed gaps when the quarter closes.
          </p>

          <p className="mt-4">
            <AssumptionsHelp triggerClass="text-sm text-brand underline-offset-4 hover:underline" />
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 text-center">
            {MODES.map((mode, i) => (
              <ModeCard key={mode.turns} mode={mode} primary={i === 0} i={i} onStart={onStart} />
            ))}
          </div>

          <p className="mt-7 text-sm">
            <a href="#lab" className="text-brand underline-offset-4 hover:underline font-medium">Simulation Lab</a>
            <span className="text-muted-foreground"> — compare spending patterns</span>
          </p>
        </div>
      </div>

      {scores.length > 0 && (
        <div className="ciso-enter mt-6 rounded-2xl border border-border bg-card p-5" style={enterStyle(4)}>
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Leaderboard</h3>
          <div className="text-sm">
            {scores.slice(0, 5).map((s, i) => (
              <div key={s.id} className="flex gap-4 py-2 border-b border-border last:border-0 items-center">
                <span className="w-6 text-center font-bold text-muted-foreground tabular-nums">{i + 1}</span>
                <span className="flex-1 truncate">{s.name}</span>
                <span className="font-bold tabular-nums">{s.score.toLocaleString()}</span>
                <span className="w-7 text-right text-brand font-semibold">{s.grade}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
