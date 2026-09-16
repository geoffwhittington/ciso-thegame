import { useState } from 'react';
import { useGame } from './GameContext';

const GAME_URL = 'https://ciso.securitycompass.com';

export function ShareCard() {
  const { game } = useGame();
  const [copied, setCopied] = useState(false);
  const grade = game.getGrade();
  const score = game.getScore();
  const survived = game.turn >= game.maxTurns && game.reputation > 0;
  const breachCost = game.getEstimatedBreachCost();

  const shareText = [
    `I played CISO for ${game.turn} quarters at a made-up AI company (the CISO game by Security Compass).`,
    ``,
    `Grade: ${grade}. Score ${score.toLocaleString()}.`,
    survived ? `I kept the job through ${game.getWinLabel()}.` : `The board asked me to resign after ${game.turn} quarters.`,
    `Stopped ${game.totalBlocked} attacks. ${game.totalBreaches} got through.`,
    game.totalBreaches > 0 ? `Those breaches would cost about $${breachCost}M in the real world.` : `No breaches.`,
    `Company value $${(game.companyValue / 1000).toFixed(0)}M.`,
    ``,
    `The job: assess how you get attacked, fund the matching tools, and make sure the team uses them.`,
    GAME_URL,
  ].join('\n');

  const copy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2.5">
      <button
        type="button"
        onClick={copy}
        className="flex-1 min-h-12 text-base font-semibold bg-[#12294d] hover:bg-[#183560] text-white rounded-xl border border-white/10 transition-colors touch-manipulation"
      >
        {copied ? 'Copied. Paste it anywhere.' : 'Copy a note to share'}
      </button>
      <button
        type="button"
        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(GAME_URL)}`, '_blank')}
        className="flex-1 min-h-12 text-base font-semibold bg-[#0A66C2] hover:bg-[#0955a3] text-white rounded-xl transition-colors touch-manipulation"
      >
        Open LinkedIn
      </button>
    </div>
  );
}
