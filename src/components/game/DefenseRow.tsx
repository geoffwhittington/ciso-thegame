import { useState } from 'react';
import { DEFENSES, DEFENSE_DEPENDENCIES, MAX_DEFENSE_LEVEL, levelMeaning, defenseCovers, countersPlain } from '@/lib/data';

type GameLike = {
  defenses: Record<string, number>;
  pendingUpgrades: Record<string, number>;
  quarterDegradations: { key: string }[];
  getUpgradeCost: (key: string) => number | null;
  getPendingSetupCost: (key: string) => number;
  getAvailableBudget: () => number;
  getEffectiveDefenseLevel: (key: string) => number;
  getGuidanceLevel: () => number;
  getLevelCap: (key: string) => number;
  reqMgmtLevel: number;
  cancelUpgrade: (key: string) => void;
  queueUpgrade: (key: string) => void;
};

export function DefenseRow({ defKey, def, game, update, relevant, target }: {
  defKey: string; def: typeof DEFENSES[string]; game: GameLike; update: () => void; relevant: boolean; target: { status: string; target: number } | null;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const level = game.defenses[defKey] || 0;
  const pending = game.pendingUpgrades[defKey] || 0;
  const eff = level + pending;
  const cost = game.getUpgradeCost(defKey);
  const nextCost = cost ?? def.setupCost;
  const canAfford = cost !== null && cost <= game.getAvailableBudget();
  const isTool = def.type === 'tool';
  const degraded = game.quarterDegradations.some(d => d.key === defKey);
  const effLevel = game.getEffectiveDefenseLevel(defKey);
  const dep = DEFENSE_DEPENDENCIES[defKey];
  const cap = game.getLevelCap(defKey);
  const canAdd = eff < cap && relevant;
  const atCap = eff >= cap;
  const cashBlock = canAdd && !canAfford;
  const tmSoon = (game.defenses.threatModel || 0) + (game.pendingUpgrades.threatModel || 0);
  const rmSoon = (game.defenses.reqMgmt || 0) + (game.pendingUpgrades.reqMgmt || 0);
  const afterQuarter = level + pending;
  const alignedSoon = Math.min(tmSoon, rmSoon);
  const previewEff = isTool ? afterQuarter : previewWorkingLevel(afterQuarter, alignedSoon, cap);
  const rmAligned = !isTool && alignedSoon > 0 && afterQuarter > 0 && alignedSoon >= afterQuarter;

  return (
    <div className={`${!relevant ? 'opacity-25' : ''} ${pending ? 'border-l-2 border-l-orange-400 pl-2 -ml-2' : ''}`}>
      <div className="flex items-center gap-2 py-2.5 border-b border-border/20">
        <button className="text-muted-foreground hover:text-foreground text-base shrink-0" onClick={() => setShowHelp(!showHelp)} aria-label="What is this">
          {showHelp ? '✕' : 'ⓘ'}
        </button>
        <span className="text-lg shrink-0 w-7 text-center">{def.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm truncate">{def.name}</div>
          <div className="text-xs text-muted-foreground leading-snug">{defenseCovers(defKey)}</div>
          {(degraded || (level > 0 && effLevel < level)) && (
            <div className="text-xs text-yellow-400">
              {workingLine(degraded, level, effLevel, game.getGuidanceLevel())}
            </div>
          )}
        </div>
        <div className="hidden sm:flex gap-1 shrink-0">
          {Array.from({ length: cap }, (_, i) => (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${dotShade(i, level, pending, previewEff, cap, rmAligned)}`}
            />
          ))}
        </div>
        {target && (target.status === 'over' || target.status === 'under') && (
          <span className={`text-xs shrink-0 ${target.status === 'over' ? 'text-yellow-400' : 'text-red-400'}`}>
            {target.status === 'over' ? 'too much' : 'advised'}
          </span>
        )}
        {!atCap || pending > 0 ? (
          <div className="flex items-stretch border border-border/60 rounded-md overflow-hidden shrink-0">
            <button
              className="w-10 text-lg text-red-400 hover:bg-red-500/10 disabled:opacity-20"
              disabled={pending <= 0}
              onClick={() => { game.cancelUpgrade(defKey); update(); }}
              aria-label="Undo last add"
            >−</button>
            <div className="px-2.5 py-1.5 min-w-[8rem] text-center leading-tight">
              {pending > 0 ? (
                <>
                  <div className="text-sm font-semibold tabular-nums text-orange-400">${game.getPendingSetupCost(defKey)}K now</div>
                  <div className="text-xs text-muted-foreground tabular-nums">${eff * def.maintainCost}K / quarter</div>
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold tabular-nums">${nextCost}K now</div>
                  <div className="text-xs text-muted-foreground tabular-nums">then ${def.maintainCost}K / q</div>
                </>
              )}
              {cashBlock && (
                <div className="text-xs text-red-400">Need ${nextCost}K. Undo another buy.</div>
              )}
            </div>
            <button
              className="w-10 text-lg text-green-400 hover:bg-green-500/10 disabled:opacity-20"
              disabled={!canAdd || !canAfford}
              onClick={() => { game.queueUpgrade(defKey); update(); }}
              aria-label={cashBlock ? `Need ${nextCost} thousand free. Undo another buy.` : `Add one level for $${nextCost} thousand`}
            >+</button>
          </div>
        ) : (
          <div className="h-10 px-3 flex items-center text-sm text-green-400 font-semibold">MAX</div>
        )}
      </div>

      {showHelp && (
        <div className="bg-muted/20 rounded px-3 py-2 text-sm text-muted-foreground space-y-1 mb-2">
          <div>{def.desc}</div>
          <div>
            Each + adds one level. Next: ${nextCost}K this quarter, then ${def.maintainCost}K every quarter.
            {isTool ? ' Level 1 stands up the program. Extra levels are cheaper and find more hidden risks.' : ' Each extra level costs the same as the first.'}
          </div>
          <div className="space-y-0.5 pt-1">
            {Array.from({ length: MAX_DEFENSE_LEVEL }, (_, i) => {
              const n = i + 1;
              const on = afterQuarter >= n;
              return (
                <div key={n} className={on ? 'text-foreground' : ''}>
                  {n}. {levelMeaning(defKey, n)}
                </div>
              );
            })}
          </div>
          {!isTool && (
            <div>
              Effectiveness rises after risk assessment and guidance at this level.
            </div>
          )}
          {def.helps.length > 0 && <div>Stops: <strong className="text-foreground">{countersPlain(def.helps)}</strong></div>}
          {def.alertLoad > 0 && <div>Generates <strong className="text-orange-400">{def.alertLoad} alerts/level</strong> — needs Security Staff to triage</div>}
          {dep?.requires && Object.keys(dep.requires).length > 0 && (
            <div>Requires: {Object.entries(dep.requires).map(([k, v]) => {
              const reqDef = DEFENSES[k];
              const label = v === 'level' ? 'same level' : v === 'level+1' ? 'one level higher' : `level ${v}+`;
              return <span key={k} className="text-foreground">{reqDef?.name} ({label}) </span>;
            })}</div>
          )}
          {dep?.boosts && dep.boosts.length > 0 && (
            <div>Made more effective by: {dep.boosts.map(k => DEFENSES[k]?.name).filter(Boolean).join(', ')}</div>
          )}
          {dep?.riskIf && <div className="text-red-400">⚠️ {dep.riskIf.desc}</div>}
          {defKey === 'secTeam' && <div>Takes effect <strong>immediately</strong> when hired</div>}
        </div>
      )}
    </div>
  );
}

function workingLine(degraded: boolean, owned: number, working: number, guidance: number): string {
  if (degraded && working === 0) return 'Setback this quarter. Not stopping attacks right now.';
  if (degraded) return 'Setback this quarter. One level weaker.';
  if (working === 0 && guidance <= 0) return 'Bought but not applied. Assess risks and tell the team how to use this.';
  if (working === 0) return 'Not aimed at a gap on your systems. Extra spend.';
  return `Only ${working} of ${owned} is working. Assessment and guidance are behind.`;
}

function previewWorkingLevel(afterQuarter: number, rm: number, cap: number): number {
  if (afterQuarter === 0) return 0;
  if (afterQuarter > rm) return rm + Math.round((afterQuarter - rm) * 0.5);
  if (rm >= afterQuarter && rm > 0) return Math.min(cap, afterQuarter + 1);
  return afterQuarter;
}

function dotShade(i: number, owned: number, pending: number, effective: number, cap: number, rmAligned: boolean): string {
  const stacked = owned + pending;
  if (rmAligned && stacked >= cap && i === cap - 1) return 'bg-cyan-400';
  if (i < owned && i < effective) return 'bg-orange-400';
  if (i < owned) return 'bg-orange-400/30';
  if (i < stacked) return 'bg-yellow-400';
  if (i < effective) return 'bg-cyan-400';
  return 'bg-muted/40';
}
