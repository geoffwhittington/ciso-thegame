import { useGame } from './GameContext';
import { ATTACKS } from '@/lib/data';
import { GameSection } from './GameSection';
import { CiteLink } from './CiteLink';
import { urlForCitation } from '@/lib/sources';

export function ThreatLandscape() {
  const { game } = useGame();
  const hasTM = game.threatModelLevel > 0;

  const activeWeaknesses = new Set<string>();
  for (const p of game.products.getLiveProducts()) {
    for (const wk of p.weaknesses) activeWeaknesses.add(wk);
  }

  const relevant = ATTACKS
    .filter(a => a.exploits.some(wk => activeWeaknesses.has(wk)))
    .sort((a, b) => b.quarterlyProb - a.quarterlyProb)
    .slice(0, 5);

  if (relevant.length === 0) return null;

  return (
    <GameSection title="Threat Landscape" hint="attacks that fit your systems">
      <div className="space-y-1">
        {relevant.map(attack => {
          // Defense status only known with threat modeling
          let status: 'unknown' | 'defended' | 'partial' | 'exposed' = 'unknown';
          if (hasTM) {
            const allDefended = attack.exploits.every(wk => {
              // Check across all products that have this weakness
              const vulnProducts = game.products.getVulnerableTo(wk);
              if (vulnProducts.length === 0) return true; // no products have this weakness unmitigated
              return vulnProducts.every(p => game.getMitigationEffectiveness(wk, p) >= 0.5);
            });
            const anyDefense = attack.exploits.some(wk =>
              game.products.getLiveProducts().some(p => game.getMitigationEffectiveness(wk, p) > 0)
            );
            status = allDefended ? 'defended' : anyDefense ? 'partial' : 'exposed';
          }

          const dotColor = {
            unknown: 'bg-muted-foreground/40',
            defended: 'bg-green-400',
            partial: 'bg-yellow-400',
            exposed: 'bg-red-400',
          }[status];

          return (
            <div key={attack.name} className="flex items-center gap-2 py-1 text-sm">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
              <span className="font-medium flex-1 truncate">{attack.name}</span>
              <span className="text-muted-foreground shrink-0 text-sm">{attack.annualRate}</span>
              <CiteLink href={urlForCitation(attack.citation, attack.source)}>{attack.source}</CiteLink>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 text-sm text-muted-foreground mt-2 pt-2 border-t border-border/20">
        {hasTM ? (
          <>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" /> Defended</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Partial</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Exposed</span>
          </>
        ) : (
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted-foreground/40" /> Anticipate your systems to see if these hits would land</span>
        )}
      </div>
    </GameSection>
  );
}
