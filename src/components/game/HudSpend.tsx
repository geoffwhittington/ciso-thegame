import { useGame } from './GameContext';
import { AssumptionsHelp } from './AssumptionsHelp';
import { GameSection } from './GameSection';
import { FlashOnChange } from './motion';

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums shrink-0 ${tone || ''}`}>{value}</span>
    </div>
  );
}

export function HudSpend() {
  const { game } = useGame();
  const avail = game.getAvailableBudget();
  const run = game.getRunCostBreakdown(false);
  const nextUpkeep = game.getRunCostBreakdown(true).upkeep;
  const newBuys = game._pendingUpgradeCost();
  const comingIn = game.quarterlyBudget + game.treasury;
  const goingOut = run.total + newBuys;
  const overflow = game.getAlertOverflow();
  const champs = game.getChampionCount();
  const agents = game.getSupervisedAgentCount();
  const fixes = game.getFixesThisQuarter();
  const cap = game.getFixCapacity();

  return (
    <GameSection title="This quarter's money" help="budget">
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">Left to spend this quarter</div>
          <div className={`text-2xl font-bold tabular-nums ${avail < 0 ? 'text-red-300' : avail < 100 ? 'text-yellow-200' : 'text-emerald-300'}`}>
            <FlashOnChange value={avail}>${avail}K</FlashOnChange>
            <span className="ml-2 text-sm font-semibold">{avail < 0 ? 'Overspent' : avail < 100 ? 'Tight' : 'Available'}</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground text-right hidden sm:block">
          Board funds security every quarter. Upkeep is taken first.
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <div>
          <div className="font-semibold mb-1">Comes in</div>
          <Row label="Board allocation (from revenue)" value={`$${game.quarterlyBudget}K`} />
          {game.treasury !== 0 && (
            <Row label="Unspent last quarter" value={`$${game.treasury}K`} />
          )}
          <Row label="Total in" value={`$${comingIn}K`} tone="font-medium text-foreground" />
        </div>
        <div>
          <div className="font-semibold mb-1">Goes out</div>
          {run.upkeep > 0 && (
            <Row label="Running the controls you already have" value={`−$${run.upkeep}K`} tone="text-brand" />
          )}
          {newBuys > 0 && (
            <Row label="New buys this quarter" value={`−$${newBuys}K`} tone="text-brand" />
          )}
          {goingOut === 0 && (
            <div className="text-muted-foreground">Nothing charged yet.</div>
          )}
          {goingOut > 0 && (
            <Row label="Total out" value={`−$${goingOut}K`} tone="font-medium text-foreground" />
          )}
        </div>
      </div>

      {nextUpkeep > run.upkeep && (
        <div className="text-sm text-muted-foreground border-t border-border pt-2">
          After these buys, running cost next quarter: <span className="text-foreground tabular-nums">${nextUpkeep}K</span>
        </div>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground border-t border-border pt-2">
        <span>{champs} champion{champs !== 1 ? 's' : ''}{agents > 0 ? ` · ${agents} agent${agents !== 1 ? 's' : ''}` : ''}</span>
        <span>
          {game.reqMgmtLevel === 0 && !game.pendingUpgrades.reqMgmt
            ? 'Buy Execute controls so staff can close risks'
            : `Staff will close ${fixes} of ${cap} risk slot${cap !== 1 ? 's' : ''} this quarter`}
          {' '}<AssumptionsHelp topic="staff" label="Why" />
        </span>
        {game.getAlertLoad() > 0 && (
          <span className={overflow > 0 ? 'text-red-300 font-semibold' : ''}>
            Alerts {game.getAlertLoad()} / staff can handle {game.getStaffCapacity() || 0}
            {overflow > 0 ? '. Alerting tools run one level weaker.' : ''}
          </span>
        )}
      </div>
    </div>
    </GameSection>
  );
}
