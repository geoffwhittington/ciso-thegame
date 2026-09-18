import { useGame } from './GameContext';
import { GameSection } from './GameSection';
import { Avatar } from './Avatar';
import { PersonaMessageInline } from './PersonaMessage';
import { getLine } from '@/lib/personas';
import { alertNarrative } from '@/lib/narrativeLabels';

export function TeamPanel() {
  const { game, update } = useGame();
  const champs = game.getChampionCount();
  const agents = game.getSupervisedAgentCount();
  const members = game.getTeamMemberCount();
  const fixes = game.getFixesThisQuarter();
  const cap = game.getFixCapacity();
  const alertLoad = game.getAlertLoad();
  const staffCap = game.getStaffCapacity();
  const overflow = game.getAlertOverflow();
  const champCost = game.getUpgradeCost('secTeam');
  const agentCost = game.getUpgradeCost('secAgents');
  const alerts = alertNarrative(alertLoad, staffCap);

  const situation = overflow > 0 ? 'alert_overload' : champs > 0 ? 'quarter_calm' : 'budget_tight';

  return (
    <GameSection title="👥 Team">
      <PersonaMessageInline id="compliance" line={getLine('compliance', situation, game.getDialogueSeed())} />

      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="stat-card stat-card-blue text-center">
          <div className="text-xl font-black comic-heading">{champs}</div>
          <div className="text-[10px] font-bold uppercase">Champions</div>
        </div>
        <div className="stat-card stat-card-teal text-center">
          <div className="text-xl font-black comic-heading">{agents}</div>
          <div className="text-[10px] font-bold uppercase">AI Agents</div>
        </div>
        <div className="stat-card stat-card-green text-center">
          <div className="text-xl font-black comic-heading">{fixes}/{cap}</div>
          <div className="text-[10px] font-bold uppercase">Risks closing</div>
        </div>
      </div>

      <div className={`text-sm font-bold mt-2 ${alerts.tone}`}>{alerts.text}</div>

      <div className="flex gap-2 mt-2">
        {champCost !== null && (
          <button className="comic-btn comic-btn-primary text-xs flex-1 disabled:opacity-40" disabled={champCost > game.getAvailableBudget()} onClick={() => { game.queueUpgrade('secTeam'); update(); }}>
            Hire +1 · ${champCost}K
          </button>
        )}
        {agentCost !== null && (
          <button className="comic-btn comic-btn-secondary text-xs flex-1 disabled:opacity-40" disabled={agentCost > game.getAvailableBudget()} onClick={() => { game.queueUpgrade('secAgents'); update(); }}>
            Agent +1 · ${agentCost}K
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        {[{ id: 'analyst' as const, n: 'Dev', r: 'Security' }, { id: 'compliance' as const, n: 'Amara', r: 'GRC' }, { id: 'board' as const, n: 'Victoria', r: 'Board' }].map(p => (
          <div key={p.id} className="flex items-center gap-1.5">
            <Avatar id={p.id} size="sm" />
            <div className="text-xs"><span className="font-bold">{p.n}</span><br/><span className="text-muted-foreground">{p.r}</span></div>
          </div>
        ))}
        <div className="text-xs text-muted-foreground self-center">{members} total staff</div>
      </div>
    </GameSection>
  );
}
