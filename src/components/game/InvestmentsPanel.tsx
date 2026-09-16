import { useGame } from './GameContext';
import { DEFENSES } from '@/lib/data';
import { DefenseRow } from './DefenseRow';
import { GameSection } from './GameSection';
import { AssumptionsHelp } from './AssumptionsHelp';

export function InvestmentsPanel() {
  const { game, update } = useGame();
  const tools = Object.entries(DEFENSES).filter(([, d]) => d.type === 'tool');
  const capabilities = Object.entries(DEFENSES).filter(([, d]) => d.type === 'capability');
  const relevant = game.getRelevantDefenses();

  const sorted = [...capabilities].sort((a, b) => {
    const aRel = relevant.has(a[0]) ? 0 : 1;
    const bRel = relevant.has(b[0]) ? 0 : 1;
    if (aRel !== bRel) return aRel - bRel;
    return (game.defenses[b[0]] || 0) - (game.defenses[a[0]] || 0);
  });

  return (
    <GameSection title="Security Investments" help="investments">
      <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        Anticipate &amp; execute
        <AssumptionsHelp topic="anticipate" label="Why" />
      </div>
      <div className="space-y-0.5">{tools.map(e => <DefenseRow key={e[0]} defKey={e[0]} def={e[1]} game={game} update={update} relevant={true} />)}</div>

      <div className="text-sm font-semibold text-muted-foreground pt-1">Defenses</div>
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand" /> Bought</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-yellow-300" /> This quarter</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-300" /> Targeted (Anticipate + Execute)</span>
        <AssumptionsHelp topic="guided" label="Why" />
      </div>
      <div className="space-y-0.5">{sorted.map(e => <DefenseRow key={e[0]} defKey={e[0]} def={e[1]} game={game} update={update} relevant={relevant.has(e[0])} />)}</div>
    </GameSection>
  );
}
