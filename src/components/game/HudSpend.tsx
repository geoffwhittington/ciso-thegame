import { useGame } from './GameContext';

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
  const hours = game.getHoursQueued();
  const hourCap = game.getHourCapacity();
  const champs = game.getChampionCount();
  const team = game.getTeamMemberCount();
  const agents = game.getSupervisedAgentCount();

  return (
    <div className="bg-card border border-border rounded-lg px-3 py-3 space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">Left to spend this quarter</div>
          <div className={`text-2xl font-bold tabular-nums ${avail < 0 ? 'text-red-400' : avail < 100 ? 'text-yellow-400' : 'text-green-400'}`}>
            ${avail}K
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
            <Row label="Running the controls you already have" value={`−$${run.upkeep}K`} tone="text-orange-400" />
          )}
          {run.falsePositives > 0 && (
            <Row label="Extra work from unread alerts" value={`−$${run.falsePositives}K`} tone="text-red-400" />
          )}
          {run.training > 0 && (
            <Row label="Training this quarter" value={`−$${run.training}K`} tone="text-orange-400" />
          )}
          {newBuys > 0 && (
            <Row label="New buys this quarter" value={`−$${newBuys}K`} tone="text-orange-400" />
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
        <span>{champs} champion{champs !== 1 ? 's' : ''} · {team} teammates · {hours}/{hourCap}h</span>
        {agents > 0 && <span>{agents} agent{agents !== 1 ? 's' : ''} freeing {agents * 2} teammates\' hours</span>}
        {game.getAlertLoad() > 0 && (
          <span className={overflow > 0 ? 'text-red-400 font-semibold' : ''}>
            Alerts {game.getAlertLoad()} / staff can handle {game.getStaffCapacity() || 0}
          </span>
        )}
      </div>
    </div>
  );
}
