import { useGame } from './GameContext';

const RING: Record<string, string> = {
  'A+': 'bg-[#f15f24] shadow-[0_0_60px_-5px_rgba(241,95,36,0.7)]',
  A: 'bg-emerald-500 shadow-[0_0_60px_-5px_rgba(16,185,129,0.6)]',
  B: 'bg-sky-500 shadow-[0_0_60px_-5px_rgba(14,165,233,0.6)]',
  C: 'bg-amber-500 shadow-[0_0_60px_-5px_rgba(245,158,11,0.6)]',
  D: 'bg-orange-600 shadow-[0_0_60px_-5px_rgba(234,88,12,0.6)]',
  F: 'bg-red-600 shadow-[0_0_60px_-5px_rgba(220,38,38,0.6)]',
};

const VERDICT: Record<string, string> = {
  'A+': 'The board would keep you',
  A: 'A strong run',
  B: 'A solid tour',
  C: 'You lasted',
  D: 'A hard tour',
  F: 'The board let you go',
};

function Pill({ value, label, tone }: { value: string | number; label: string; tone?: string }) {
  return (
    <div className="flex-1 min-w-0 rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-center">
      <div className={`text-xl sm:text-2xl font-bold tabular-nums leading-none ${tone || 'text-white'}`}>{value}</div>
      <div className="text-xs text-white/60 mt-1.5 leading-tight">{label}</div>
    </div>
  );
}

export function GameOverHero() {
  const { game } = useGame();
  const grade = game.getGrade();
  const score = game.getScore();
  const survived = game.turn >= game.maxTurns && game.reputation > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0e1f3a]">
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-[#f15f24]/20 blur-3xl" />
      <div className="h-1.5 bg-[#f15f24]" />

      <div className="relative px-6 py-8 sm:py-10 text-center text-white">
        <div className="text-xs uppercase tracking-widest text-white/50">CISO · Security Compass</div>

        <div className={`mt-6 mx-auto w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center ${RING[grade] || RING.F}`}>
          <span className={`font-black leading-none ${grade === 'A+' ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'}`}>{grade}</span>
        </div>

        <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight">
          {survived
            ? (game.maxTurns <= 3 ? 'You completed the interim assignment' : `You made it to ${game.getWinLabel()}`)
            : 'Your tour is over'}
        </h1>
        <p className="mt-1.5 text-base sm:text-lg text-white/70">
          {survived ? `Final grade ${grade}` : (grade === 'F' ? 'Reputation reached zero' : VERDICT[grade])}
        </p>

        <p className="mt-4 mx-auto max-w-md text-sm sm:text-base text-white/80 leading-relaxed">
          {game.getDebrief()}
        </p>

        <div className="mt-7 flex gap-2 sm:gap-3">
          <Pill value={game.totalBlocked} label="attacks stopped" tone="text-emerald-300" />
          <Pill value={game.totalBreaches} label="got through" tone={game.totalBreaches > 0 ? 'text-red-300' : 'text-emerald-300'} />
          <Pill value={`$${(game.companyValue / 1000).toFixed(0)}M`} label="company value" />
          <Pill value={score.toLocaleString()} label="score" />
        </div>
      </div>
    </div>
  );
}
