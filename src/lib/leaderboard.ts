const STORAGE_KEY = 'multica_leaderboard';

export interface LeaderboardEntry {
  id?: number;
  date?: string;
  name: string;
  score: number;
  grade: string;
  turns: number;
  breaches: number;
  valuation: string;
  blindSpots?: number;
  falsePositiveCost?: number;
  degradationEvents?: number;
  estimatedBreachCost?: number;
  threatModelTurn?: number;
  reqMgmtTurn?: number;
}

export function getScores(): LeaderboardEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export function saveScore(entry: LeaderboardEntry): LeaderboardEntry[] {
  const scores = getScores();
  entry.id = Date.now();
  entry.date = new Date().toLocaleDateString();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top));
  return top;
}
