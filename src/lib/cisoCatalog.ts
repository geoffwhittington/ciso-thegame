import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hydrateWeaknesses, type Weakness } from './data';

export function loadWeaknessCatalog(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(here, '../../public/data/weaknesses.json'), 'utf8');
  hydrateWeaknesses(JSON.parse(raw) as Record<string, Weakness>);
}
