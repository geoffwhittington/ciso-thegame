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
        {tools.map(e => <DefenseRow key={e[0]} defKey={e[0]} def={e[1]} game={game} update={update} relevant={true} />)}
      </div>

      <div className="text-sm font-black comic-heading pt-2 flex items-center gap-2">
        Defenses
        <AssumptionsHelp topic="guided" label="Why" />
      </div>
      <div className="flex flex-wrap gap-2 text-sm mb-2">
        <span className="comic-badge comic-badge-owned">● Bought</span>
        <span className="comic-badge comic-badge-yellow">● This quarter</span>
        <span className="comic-badge comic-badge-blue">● Targeted</span>
      </div>
      <div className="space-y-2">
        {INVESTMENT_CATEGORIES.map(cat => (
          <InvestmentCard key={cat.id} category={cat} game={game} update={update} relevant={relevant} />
        ))}
      </div>
    </GameSection>
  );
}
