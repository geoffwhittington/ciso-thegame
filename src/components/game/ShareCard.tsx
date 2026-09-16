import { useState } from 'react';
import { useGame } from './GameContext';

const GAME_URL = 'https://ciso.securitycompass.com';

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function ShareCard() {
  const { game } = useGame();
  const [copied, setCopied] = useState(false);
  const [liHint, setLiHint] = useState(false);
  const grade = game.getGrade();
  const score = game.getScore();
  const survived = game.turn >= game.maxTurns && game.reputation > 0;
  const breachCost = game.getEstimatedBreachCost();

  const shareText = [
    `I played CISO for ${game.turn} quarters at a made-up AI company (the CISO game by Security Compass).`,
    ``,
    `Grade: ${grade}. Score ${score.toLocaleString()}.`,
    survived
      ? (game.maxTurns <= 3
        ? `I completed an interim CISO assignment (${game.maxTurns} quarters).`
        : `I kept the ${game.getRoleLabel()} seat through ${game.getWinLabel()}.`)
      : `The board asked me to resign after ${game.turn} quarters.`,
    `Stopped ${game.totalBlocked} attacks. ${game.totalBreaches} got through.`,
    game.totalBreaches > 0 ? `Those breaches would cost about $${breachCost}M in the real world.` : `No breaches.`,
    `Company value $${(game.companyValue / 1000).toFixed(0)}M.`,
    ``,
    `The job: assess how you get attacked, fund the matching tools, and make sure the team uses them.`,
    GAME_URL,
  ].join('\n');

  const markCopied = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(shareText);
    setLiHint(false);
    markCopied();
  };

  const shareLinkedIn = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch { /* still open LinkedIn */ }
    const href = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;
    window.open(href, '_blank', 'noopener,noreferrer');
    setLiHint(true);
    markCopied();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => void copy()}
          className="flex-1 min-h-12 px-4 text-base font-semibold bg-[#12294d] hover:bg-[#183560] text-white rounded-xl border border-white/10 transition-colors touch-manipulation"
        >
          {copied && !liHint ? 'Copied. Paste it anywhere.' : 'Copy a note to share'}
        </button>
        <button
          type="button"
          onClick={() => void shareLinkedIn()}
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
          className="shrink-0 size-12 inline-flex items-center justify-center rounded-xl bg-[#0A66C2] hover:bg-[#0955a3] text-white transition-colors touch-manipulation"
        >
          <LinkedInIcon />
        </button>
      </div>
      {liHint && (
        <p className="text-sm text-muted-foreground text-center">
          Post copied. LinkedIn should open with it — paste if the box is empty.
        </p>
      )}
    </div>
  );
}
