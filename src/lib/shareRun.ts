const GAME_URL = 'https://ciso.securitycompass.com';

export function runShareText(game: {
  turn: number;
  getGrade: () => string;
  getScore: () => number;
  maxTurns: number;
  reputation: number;
  getRoleLabel: () => string;
  getWinLabel: () => string;
  totalBlocked: number;
  totalBreaches: number;
  getEstimatedBreachCost: () => number;
  companyValue: number;
}): string {
  const survived = game.turn >= game.maxTurns && game.reputation > 0;
  const grade = game.getGrade();
  const score = game.getScore();
  const breachCost = game.getEstimatedBreachCost();
  return [
    `I played CISO for ${game.turn} quarters at a made-up AI company (the CISO game by Acme Security Company).`,
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
}

export async function shareRunToLinkedIn(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch { /* still open LinkedIn */ }
  const href = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
  window.open(href, '_blank', 'noopener,noreferrer');
}
