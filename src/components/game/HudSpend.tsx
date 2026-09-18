import { useGame } from './GameContext';
import { AssumptionsHelp } from './AssumptionsHelp';
import { GameSection } from './GameSection';
import { PersonaMessageInline } from './PersonaMessage';
import { getLine } from '@/lib/personas';

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between gap-2 py-0.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums shrink-0 font-bold ${tone || ''}`}>{value}</span>
    </div>
  );
}

export function HudSpend() {
  const { game } = useGame();
  const run = game.getRunCostBreakdown(false);
  const newBuys = game._pendingUpgradeCost();
  const fixes = game.getFixesThisQuarter();
  const cap = game.getFixCapacity();
  const budgetSituation = game.getAvailableBudget() < 100 ? 'budget_tight' : 'budget_flush';
  const guidance = game.getGuidanceSavings(true);
  const hasPlanningProgram = game.threatModelLevel > 0 || game.reqMgmtLevel > 0;

  return (
    <GameSection title="💰 Money" help="budget">
      <div className="space-y-1">
        <Row label="Revenue-based funding" value={`$${game.getRevenueBasedBudget()}K`} />
        <Row label="Product-risk funding" value={`+$${game.getProductRiskBudget()}K`} tone="text-emerald-700" />
        <Row label="Total board allocation" value={`$${game.quarterlyBudget}K`} tone="text-foreground" />
        {game.treasury !== 0 && <Row label="Carried over" value={`$${game.treasury}K`} />}
        {run.upkeep > 0 && <Row label="Upkeep" value={`−$${run.upkeep}K`} tone="text-brand" />}
        {newBuys > 0 && <Row label="New buys" value={`−$${newBuys}K`} tone="text-brand" />}
      </div>
      {hasPlanningProgram && (
        <div className={`rounded-lg px-2.5 py-2 text-xs ${
          guidance.netSaved > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          <div className="font-bold">Are threat modeling and requirements saving money?</div>
          <div className="flex justify-between gap-2">
            <span>TM + requirements cost</span>
            <strong>${guidance.planningCost}K/q</strong>
          </div>
          <div className="flex justify-between gap-2">
            <span>Lower costs elsewhere</span>
            <strong>${guidance.controlSavings}K/q</strong>
          </div>
          <div className="font-black mt-0.5">
            {guidance.netSaved > 0
              ? `Yes — you save $${guidance.netSaved}K each quarter overall`
              : guidance.netSaved === 0
                ? 'They currently break even'
                : `Not yet — they cost $${Math.abs(guidance.netSaved)}K extra each quarter overall`}
          </div>
          {guidance.netSaved < 0 && (
            <div className="mt-0.5">They can save more as you add controls they help manage.</div>
          )}
        </div>
      )}
      {cap > 0 && (
        <div className="text-xs text-muted-foreground mt-1">
          Staff closing {fixes}/{cap} risk{cap !== 1 ? 's' : ''} this quarter
          {' '}<AssumptionsHelp topic="staff" label="?" />
        </div>
      )}
      {game.reqMgmtLevel === 0 && !game.pendingUpgrades.reqMgmt && (
        <div className="text-xs text-muted-foreground mt-1">
          Buy requirements so staff can close risks
        </div>
      )}
      <PersonaMessageInline id="ceo" line={getLine('ceo', budgetSituation, game.turn)} />
    </GameSection>
  );
}
