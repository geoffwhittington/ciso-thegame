import { getScores } from '@/lib/leaderboard';
import { AssumptionsHelp } from './AssumptionsHelp';
import { enterStyle } from './motion';

const MODES = [
  { turns: 3, label: 'Interim CISO', quarters: '3 quarters', blurb: 'A short tour. Learn the ropes fast.' },
  { turns: 8, label: 'Series B CISO', quarters: '8 quarters', blurb: 'Scale threat modeling and security requirements as the company grows.' },
  { turns: 20, label: 'IPO-path CISO', quarters: '20 quarters', blurb: 'The long game. Survive to the public markets.' },
] as const;

const MODE_COLORS = ['stat-card-coral', 'stat-card-yellow', 'stat-card-teal'] as const;

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
      className={`ciso-enter comic-card text-left p-4 ${MODE_COLORS[i]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-black comic-heading text-lg">{mode.label}</span>
        {primary && (
          <span className="comic-badge comic-badge-red text-[10px]">Start here</span>
        )}
      </div>
      <div className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">{mode.quarters}</div>
      <p className="text-sm mt-2 leading-snug opacity-80">{mode.blurb}</p>
    </button>
  );
}

export function TitleScreen({ onStart }: { onStart: (turns: number) => void }) {
  const scores = getScores();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="ciso-enter comic-card overflow-hidden">
        <div className="h-2 bg-brand" />
        <div className="px-6 sm:px-10 pt-9 pb-8 text-center paper-texture">
          <div className="text-6xl mb-3" aria-hidden>🛡️</div>
          <h1 className="text-6xl font-black tracking-wider comic-heading text-brand" style={{ textShadow: '3px 3px 0 #1a1a2e' }}>
            CISO
          </h1>
          <p className="text-xl font-bold mt-2 comic-heading">Survive the Board. Outsmart the Breach.</p>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground mt-2">Acme Security Company</p>

          <p className="handwritten text-muted-foreground leading-relaxed mt-5 max-w-md mx-auto">
            Assume the CISO role at a growth-stage company. Incident rates are drawn from
            published industry data. Allocate budget each quarter; staff address a limited number
            of listed gaps when the quarter closes.
          </p>

          <p className="mt-4">
            <AssumptionsHelp triggerClass="text-sm text-brand font-bold underline-offset-4 hover:underline" />
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 text-center">
            {MODES.map((mode, i) => (
              <ModeCard key={mode.turns} mode={mode} primary={i === 0} i={i} onStart={onStart} />
            ))}
          </div>

          <p className="mt-7 text-sm font-bold">
            <a href="#lab" className="text-brand underline-offset-4 hover:underline">Simulation Lab</a>
            <span className="text-muted-foreground"> — compare spending patterns</span>
          </p>
        </div>
      </div>

      {scores.length > 0 && (
        <div className="ciso-enter comic-card mt-6 p-5" style={enterStyle(4)}>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3 comic-heading">🏆 Leaderboard</h3>
          <div className="text-sm">
            {scores.slice(0, 5).map((s, i) => (
              <div key={s.id} className="flex gap-4 py-2 border-b-2 border-dashed border-border/30 last:border-0 items-center">
                <span className="w-6 text-center font-black text-muted-foreground tabular-nums comic-heading text-lg">{i + 1}</span>
                <span className="flex-1 truncate font-semibold">{s.name}</span>
                <span className="font-black tabular-nums">{s.score.toLocaleString()}</span>
                <span className="w-7 text-right text-brand font-black comic-heading text-lg">{s.grade}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
