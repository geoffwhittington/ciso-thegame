import { useGame } from './GameContext';
import { runShareText, shareRunToLinkedIn } from '@/lib/shareRun';

const RING: Record<string, string> = {
  'A+': 'bg-[#f15f24] shadow-[0_0_24px_-4px_rgba(241,95,36,0.7)]',
  A: 'bg-emerald-500 shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)]',
  B: 'bg-sky-500 shadow-[0_0_24px_-4px_rgba(14,165,233,0.6)]',
  C: 'bg-amber-500 shadow-[0_0_24px_-4px_rgba(245,158,11,0.6)]',
  D: 'bg-orange-600 shadow-[0_0_24px_-4px_rgba(234,88,12,0.6)]',
  F: 'bg-red-600 shadow-[0_0_24px_-4px_rgba(220,38,38,0.6)]',
};

function Stat({ icon, value, label, tone }: { icon: string; value: string | number; label: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 text-left flex items-center gap-3">
      <span className="text-xl leading-none shrink-0" aria-hidden>{icon}</span>
      <div className="min-w-0">
        <div className={`text-xl font-bold tabular-nums leading-none ${tone || 'text-white'}`}>{value}</div>
        <div className="text-xs text-white/60 mt-1 leading-tight">{label}</div>
      </div>
    </div>
  );
}

export function GameOverHero() {
  const { game } = useGame();
  const grade = game.getGrade();
  const score = game.getScore();
  const passed = grade !== 'F' && grade !== 'D' && game.reputation > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#12264a] to-[#0c1a34] shadow-2xl">
      <div className={`h-1.5 ${passed ? 'bg-emerald-500' : 'bg-[#f15f24]'}`} />
      <button
        type="button"
        onClick={() => void shareRunToLinkedIn(runShareText(game))}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        className="absolute top-3.5 right-3.5 z-10 h-8 px-3 inline-flex items-center gap-1.5 rounded-full bg-[#0A66C2] hover:bg-[#0955a3] text-white text-xs font-semibold transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        Share
      </button>
      <div className="relative px-6 sm:px-10 pt-8 pb-7 text-center text-white">
        <div className="text-xs uppercase tracking-[0.2em] text-white/45">
          {game.getRoleLabel()} · {game.turn} of {game.maxTurns} quarters
        </div>

        <div className={`mt-5 mx-auto w-24 h-24 rounded-full flex flex-col items-center justify-center ${RING[grade] || RING.F}`}>
          <span className={`font-black leading-none ${grade === 'A+' ? 'text-4xl' : 'text-5xl'}`}>{grade}</span>
          <span className="text-[10px] uppercase tracking-wide text-white/80 mt-1">grade</span>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
          {game.getHeadline()}
        </h1>
        <p className="mt-3 mx-auto max-w-md text-[15px] text-white/80 leading-relaxed">
          {game.getDebrief()}
        </p>

        <div className="mt-7 grid grid-cols-2 gap-2.5 text-left">
          <Stat icon="🛡️" value={game.totalBlocked} label="attacks stopped" tone="text-emerald-300" />
          <Stat icon="🚨" value={game.totalBreaches} label="attacks got through" tone={game.totalBreaches > 0 ? 'text-red-300' : 'text-emerald-300'} />
          <Stat icon="💰" value={`$${(game.companyValue / 1000).toFixed(0)}M`} label="company value" />
          <Stat icon="⭐" value={score.toLocaleString()} label="final score" />
        </div>
      </div>
    </div>
  );
}
