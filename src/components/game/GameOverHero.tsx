import { useGame } from './GameContext';
import { runShareText, shareRunToLinkedIn } from '@/lib/shareRun';
import { PersonaMessage } from './PersonaMessage';
import { getLine } from '@/lib/personas';

const RING: Record<string, string> = {
  'A+': 'bg-brand border-brand',
  A: 'bg-emerald-500 border-emerald-600',
  B: 'bg-sky-500 border-sky-600',
  C: 'bg-amber-500 border-amber-600',
  D: 'bg-orange-600 border-orange-700',
  F: 'bg-red-600 border-red-700',
};

export function GameOverHero() {
  const { game } = useGame();
  const grade = game.getGrade();
  const passed = grade !== 'F' && grade !== 'D' && game.reputation > 0;
  const situation = passed ? 'gameover_win' : 'gameover_lose';

  return (
    <div className="comic-card relative overflow-hidden">
      <div className={`h-2 ${passed ? 'bg-emerald-500' : 'bg-brand'}`} />
      <button
        type="button"
        onClick={() => void shareRunToLinkedIn(runShareText(game))}
        aria-label="Share on LinkedIn"
        className="absolute top-3 right-3 z-10 h-8 px-3 inline-flex items-center gap-1.5 rounded-full bg-[#0A66C2] hover:bg-[#0955a3] text-white text-xs font-bold border-2 border-foreground/20"
      >
        Share
      </button>
      <div className="relative px-4 sm:px-8 pt-6 pb-5 text-center paper-texture">
        <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          {game.getRoleLabel()} · {game.turn}/{game.maxTurns} quarters
        </div>

        <div className={`mt-4 mx-auto w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 text-white ${RING[grade] || RING.F}`} style={{ boxShadow: '4px 4px 0 #1a1a2e' }}>
          <span className={`font-black leading-none comic-heading ${grade === 'A+' ? 'text-3xl' : 'text-4xl'}`}>{grade}</span>
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl font-black comic-heading text-brand">
          {game.getHeadline()}
        </h1>

        <div className="mt-4 space-y-1 text-left max-w-md mx-auto">
          <PersonaMessage id="board" line={getLine('board', situation, game.getDialogueSeed())} compact />
          <PersonaMessage id="ceo" line={getLine('ceo', situation, game.getDialogueSeed())} compact />
          <PersonaMessage id="analyst" line={getLine('analyst', situation, game.getDialogueSeed())} compact />
          <PersonaMessage id="ciso" line={getLine('ciso', situation, game.getDialogueSeed())} compact />
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          <span className="comic-badge comic-badge-green">🛡️ {game.totalBlocked} stopped</span>
          <span className={`comic-badge ${game.totalBreaches === 0 ? 'comic-badge-green' : 'comic-badge-red'}`}>
            🚨 {game.totalBreaches} breaches
          </span>
          <span className="comic-badge comic-badge-blue">💰 ${(game.companyValue / 1000).toFixed(0)}M value</span>
          {game.totalGuidanceSavings !== 0 && (
            <span className={`comic-badge ${game.totalGuidanceSavings > 0 ? 'comic-badge-green' : 'comic-badge-yellow'}`}>
              {game.totalGuidanceSavings > 0
                ? `💡 $${game.totalGuidanceSavings}K guidance savings`
                : `💡 $${Math.abs(game.totalGuidanceSavings)}K program investment`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
