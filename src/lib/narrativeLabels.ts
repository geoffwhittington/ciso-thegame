export function trustLabel(rep: number): { text: string; tone: string } {
  if (rep <= 0) return { text: 'Fired.', tone: 'text-red-600' };
  if (rep < 15) return { text: 'One more incident and you\'re done', tone: 'text-red-600' };
  if (rep < 30) return { text: 'You\'re on thin ice', tone: 'text-red-500' };
  if (rep < 45) return { text: 'The board is watching', tone: 'text-yellow-600' };
  if (rep < 60) return { text: 'Cautiously optimistic', tone: 'text-yellow-600' };
  if (rep < 75) return { text: 'The board trusts you', tone: 'text-emerald-600' };
  if (rep < 90) return { text: 'Strong confidence', tone: 'text-emerald-600' };
  return { text: 'The board loves you', tone: 'text-emerald-600' };
}

export function postureLabel(posture: number): { text: string; tone: string } {
  if (posture < 10) return { text: 'No defenses', tone: 'text-red-600' };
  if (posture < 25) return { text: 'Paper-thin', tone: 'text-red-500' };
  if (posture < 40) return { text: 'Bare minimum', tone: 'text-yellow-600' };
  if (posture < 55) return { text: 'Some coverage', tone: 'text-yellow-600' };
  if (posture < 70) return { text: 'Solid posture', tone: 'text-emerald-600' };
  if (posture < 85) return { text: 'Well defended', tone: 'text-emerald-600' };
  return { text: 'Fort Knox', tone: 'text-emerald-600' };
}

export function incidentSummary(blocked: number, contained: number, breaches: number): { text: string; tone: string } {
  const total = blocked + contained + breaches;
  if (total === 0) return { text: 'Quiet so far', tone: 'text-muted-foreground' };
  if (breaches === 0 && contained === 0) return { text: 'All threats stopped', tone: 'text-emerald-600' };
  if (breaches === 0) return { text: 'Held the line', tone: 'text-yellow-600' };
  if (breaches === 1) return { text: 'Took a hit', tone: 'text-red-500' };
  if (breaches <= 3) return { text: 'It\'s been rough', tone: 'text-red-600' };
  return { text: 'Under siege', tone: 'text-red-600' };
}

export function budgetMood(available: number, total: number): { text: string; tone: string } {
  if (available < 0) return { text: 'Overspent!', tone: 'text-red-600' };
  const pct = total > 0 ? available / total : 1;
  if (pct < 0.1) return { text: 'Scraping by', tone: 'text-yellow-600' };
  if (pct < 0.3) return { text: 'Tight', tone: 'text-yellow-600' };
  if (pct < 0.6) return { text: 'Comfortable', tone: 'text-emerald-600' };
  return { text: 'Flush', tone: 'text-emerald-600' };
}

export function alertNarrative(load: number, capacity: number): { text: string; tone: string } {
  if (load === 0) return { text: 'No alerts', tone: 'text-muted-foreground' };
  if (capacity === 0 && load > 0) return { text: 'No one watching', tone: 'text-red-600' };
  if (load > capacity) return { text: 'Drowning in alerts', tone: 'text-red-600' };
  if (load > capacity * 0.8) return { text: 'Stretched thin', tone: 'text-yellow-600' };
  return { text: 'Under control', tone: 'text-emerald-600' };
}

export function trustMeterFill(rep: number): string {
  if (rep < 30) return 'bg-red-500';
  if (rep < 50) return 'bg-yellow-500';
  return 'bg-emerald-500';
}

export function postureMeterFill(posture: number): string {
  if (posture < 30) return 'bg-red-500';
  if (posture < 55) return 'bg-yellow-500';
  return 'bg-emerald-500';
}
