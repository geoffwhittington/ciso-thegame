import { useGame } from './GameContext';
import { DEFENSES } from '@/lib/data';
import { DefenseRow } from './DefenseRow';
import { GameSection } from './GameSection';

export function InvestmentsPanel() {
  const { game, update } = useGame();
  const tools = Object.entries(DEFENSES).filter(([, d]) => d.type === 'tool');
  const capabilities = Object.entries(DEFENSES).filter(([, d]) => d.type === 'capability');
  const relevant = game.getRelevantDefenses();
  const targets = game.getTargetLevels();
  const overInvested = game.getOverInvestments();
  const deployRisks = game.getDeploymentRisks();

  const sorted = [...capabilities].sort((a, b) => {
    const aRel = relevant.has(a[0]) ? 0 : 1;
    const bRel = relevant.has(b[0]) ? 0 : 1;
    if (aRel !== bRel) return aRel - bRel;
    return (game.defenses[b[0]] || 0) - (game.defenses[a[0]] || 0);
  });

  return (
    <GameSection title="Security Investments">
      {deployRisks.length > 0 && (
        <div className="text-sm text-red-400 bg-red-500/5 border border-red-500/20 rounded px-3 py-2">
          ⚠️ {deployRisks.map(r => r.desc).join('. ')}
        </div>
      )}

      {overInvested.length > 0 && (
        <div className="text-sm text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 rounded px-3 py-2">
          Over-invested: {overInvested.map(o => `${o.name} Lv${o.current} (needs ${o.needed})`).join(', ')}
        </div>
      )}

      <div className="text-sm font-semibold text-muted-foreground">Anticipate &amp; execute</div>
      <div className="space-y-0.5">{tools.map(e => <DefenseRow key={e[0]} defKey={e[0]} def={e[1]} game={game} update={update} relevant={true} target={targets[e[0]] || null} />)}</div>

      <div className="text-sm font-semibold text-muted-foreground pt-1">Defenses</div>
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-400" /> Bought</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-yellow-400" /> This quarter</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Stronger with prediction + execution</span>
        {game.threatModelLevel > 0 && (
          <>
            <span><span className="text-red-400">▲</span> Under</span>
            <span><span className="text-green-400">✓</span> On target</span>
            <span><span className="text-yellow-400">▼</span> Over</span>
          </>
        )}
      </div>
      <div className="space-y-0.5">{sorted.map(e => <DefenseRow key={e[0]} defKey={e[0]} def={e[1]} game={game} update={update} relevant={relevant.has(e[0])} target={targets[e[0]] || null} />)}</div>
    </GameSection>
  );
}
