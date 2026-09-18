import { useGame } from './GameContext';
import { DEFENSES } from '@/lib/data';
import { DefenseRow } from './DefenseRow';
import { GameSection } from './GameSection';
import { AssumptionsHelp } from './AssumptionsHelp';
import { InvestmentCard, INVESTMENT_CATEGORIES } from './InvestmentCard';

export function InvestmentsPanel() {
  const { game, update } = useGame();
  const tools = Object.entries(DEFENSES).filter(([, d]) => d.type === 'tool');
  const relevant = game.getRelevantDefenses();

  return (
    <GameSection title="🔧 Security Investments" help="investments">
      <div className="text-sm font-black comic-heading flex items-center gap-2">
        Threat Modeling & Requirements
        <AssumptionsHelp topic="anticipate" label="Why" />
      </div>
      <div className="space-y-0.5">
        {tools.map(e => <DefenseRow key={e[0]} defKey={e[0]} def={e[1]} game={game} update={update} relevant={true} compact />)}
      </div>

      <div className="text-sm font-black comic-heading pt-2 flex items-center gap-2 border-t-2 border-foreground/10">
        Defenses
        <AssumptionsHelp topic="guided" label="Why" />
      </div>
      <div className="space-y-2">
        {INVESTMENT_CATEGORIES.map(cat => (
          <InvestmentCard key={cat.id} category={cat} game={game} update={update} relevant={relevant} />
        ))}
      </div>
    </GameSection>
  );
}
