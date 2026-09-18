import { useState } from 'react';
import { DEFENSES, DEFENSE_DEPENDENCIES, MAX_DEFENSE_LEVEL, levelMeaning, defenseCovers, countersPlain } from '@/lib/data';

type GameLike = {
  defenses: Record<string, number>;
  pendingUpgrades: Record<string, number>;
  quarterDegradations: { key: string; text: string }[];
  getUpgradeCost: (key: string) => number | null;
  getPendingSetupCost: (key: string) => number;
  getAvailableBudget: () => number;
  getEffectiveDefenseLevel: (key: string) => number;
  getGuidanceLevel: () => number;
  getLevelCap: (key: string) => number;
  getAlertOverflow: () => number;
  getAnticipatedNeed: (key: string) => number;
  threatModelLevel: number;
  cancelUpgrade: (key: string) => void;
  queueUpgrade: (key: string) => void;
};

export function DefenseRow({ defKey, def, game, update, relevant }: {
  defKey: string; def: typeof DEFENSES[string]; game: GameLike; update: () => void; relevant: boolean;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const level = game.defenses[defKey] || 0;
  const pending = game.pendingUpgrades[defKey] || 0;
  const eff = level + pending;
  const cost = game.getUpgradeCost(defKey);
  const nextCost = cost ?? def.setupCost;
  const canAfford = cost !== null && cost <= game.getAvailableBudget();
  const isTool = def.type === 'tool';
  const setback = game.quarterDegradations.find(d => d.key === defKey);
  const alertOverload = def.alertLoad > 0 && game.getAlertOverflow() > 0;
  const opsHit = !!setback || alertOverload;
  const effLevel = game.getEffectiveDefenseLevel(defKey);
  const dep = DEFENSE_DEPENDENCIES[defKey];
  const cap = game.getLevelCap(defKey);
  const canAdd = eff < cap && relevant;
  const atCap = eff >= cap;
  const tmSoon = (game.defenses.threatModel || 0) + (game.pendingUpgrades.threatModel || 0);
  const rmSoon = (game.defenses.reqMgmt || 0) + (game.pendingUpgrades.reqMgmt || 0);
  const afterQuarter = level + pending;
  const alignedSoon = Math.min(tmSoon, rmSoon);
  const rmAligned = !isTool && alignedSoon > 0 && afterQuarter > 0 && alignedSoon >= afterQuarter;
  const need = !isTool ? game.getAnticipatedNeed(defKey) : 0;
  const recommended = relevant && game.threatModelLevel > 0 && need > eff;
  const accent = pending ? 'border-l-4 border-l-brand pl-2 -ml-2' : recommended ? 'border-l-4 border-l-amber-400 pl-2 -ml-2' : '';

  return (
    <div className={`${!relevant ? 'opacity-25' : ''} ${accent}`}>
      <div className="flex items-center gap-2 py-2.5 border-b-2 border-dashed border-border/20">
        <button className="text-muted-foreground hover:text-foreground text-base shrink-0 font-bold" onClick={() => setShowHelp(!showHelp)} aria-label="What is this">
          {showHelp ? '✕' : 'ⓘ'}
        </button>
        <span className="text-lg shrink-0 w-7 text-center">{def.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-sm truncate">{def.name}</span>
            {isTool && pending > 0 && (
              <span className="comic-badge comic-badge-green text-[10px] shrink-0">
                Findings live
              </span>
            )}
            {recommended && (
              <span className="comic-badge comic-badge-yellow text-[10px] shrink-0">
                Aim Lv{need}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground leading-snug">{defenseCovers(defKey)}</div>
          {(opsHit || (level > 0 && effLevel < level)) && (
            <div className="text-xs text-yellow-600 font-bold">
              {workingLine({
                setbackText: setback?.text,
                alertOverload,
                owned: level,
                working: effLevel,
                missing: missingReqNames(defKey, game, level),
              })}
            </div>
          )}
          {!isTool && level > 0 && !opsHit && game.getGuidanceLevel() <= 0 && (
            <div className="text-xs text-muted-foreground">Generic coverage. Industry residual.</div>
          )}
        </div>
        <div className="hidden sm:flex gap-1 shrink-0">
          {Array.from({ length: cap }, (_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full border-2 border-foreground/30 ${dotShade(i, level, pending, cap, rmAligned)} ${recommended && i >= eff && i < need ? 'ring-2 ring-amber-400' : ''}`}
            />
          ))}
        </div>
        {!atCap || pending > 0 ? (
          <div className={`flex items-stretch border-3 border-foreground/20 rounded-lg overflow-hidden shrink-0 ${!canAfford && pending === 0 ? 'opacity-40' : ''}`}>
            <button
              className="w-11 min-h-[44px] text-lg font-black text-red-500 hover:bg-red-100 disabled:opacity-20"
              disabled={pending <= 0}
              onClick={() => { game.cancelUpgrade(defKey); update(); }}
              aria-label="Undo last add"
            >−</button>
            <div className="px-2 sm:px-2.5 py-1.5 min-w-[6rem] sm:min-w-[8rem] text-center leading-tight bg-card">
              {pending > 0 ? (
                <>
                  <div className="text-sm font-black tabular-nums text-brand">${game.getPendingSetupCost(defKey)}K now</div>
                  <div className="text-xs text-muted-foreground tabular-nums font-bold">${eff * def.maintainCost}K / quarter</div>
                </>
              ) : (
                <>
                  <div className="text-sm font-bold tabular-nums text-muted-foreground">${nextCost}K now</div>
                  <div className="text-xs text-muted-foreground tabular-nums">then ${def.maintainCost}K / q</div>
                </>
              )}
            </div>
            <button
              className="w-11 min-h-[44px] text-lg font-black text-emerald-500 hover:bg-emerald-100 disabled:opacity-20"
              disabled={!canAdd || !canAfford}
              onClick={() => { game.queueUpgrade(defKey); update(); }}
              aria-label={!canAfford ? 'Insufficient remaining budget' : `Add one level for $${nextCost} thousand`}
            >+</button>
          </div>
        ) : (
          <div className="h-10 px-3 flex items-center comic-badge comic-badge-green font-black">MAX</div>
        )}
      </div>

      {showHelp && (
        <div className="stat-card stat-card-blue text-sm space-y-1 mb-2 mt-1">
          <div className="font-semibold">{def.desc}</div>
          <div className="text-muted-foreground">
            Each + adds one level. Next: ${nextCost}K this quarter, then ${def.maintainCost}K every quarter.
            {isTool ? ` Level 1 stands up ${def.name.toLowerCase()}. Extra levels cover more of the estate.` : ' Each extra level costs the same as the first.'}
          </div>
          <div className="space-y-0.5 pt-1">
            {Array.from({ length: MAX_DEFENSE_LEVEL }, (_, i) => {
              const n = i + 1;
              const on = afterQuarter >= n;
              return (
                <div key={n} className={on ? 'font-bold' : 'text-muted-foreground'}>
                  {n}. {levelMeaning(defKey, n)}
                </div>
              );
            })}
          </div>
          {!isTool && (
            <div className="text-muted-foreground">Applies as a generic setup without threat modeling. Listed gaps need threat modeling plus security requirements.</div>
          )}
          {def.helps.length > 0 && <div>Stops: <strong>{countersPlain(def.helps)}</strong></div>}
          {def.alertLoad > 0 && <div>Generates <strong className="text-brand">{def.alertLoad} alerts/level</strong>. Needs Security Staff or those tools run one level weaker.</div>}
          {dep?.requires && Object.keys(dep.requires).length > 0 && (
            <div>Requires: {Object.entries(dep.requires).map(([k, v]) => {
              const reqDef = DEFENSES[k];
              const label = v === 'level' ? 'same level' : v === 'level+1' ? 'one level higher' : `level ${v}+`;
              return <span key={k} className="font-bold">{reqDef?.name} ({label}) </span>;
            })}</div>
          )}
          {dep?.boosts && dep.boosts.length > 0 && (
            <div>Made more effective by: {dep.boosts.map(k => DEFENSES[k]?.name).filter(Boolean).join(', ')}</div>
          )}
          {dep?.riskIf && <div className="text-red-600 font-bold">⚠️ {dep.riskIf.desc}</div>}
          {defKey === 'secTeam' && <div className="font-bold">Takes effect immediately when hired</div>}
        </div>
      )}
    </div>
  );
}

function missingReqNames(defKey: string, game: GameLike, ownedLevel: number): string[] {
  const dep = DEFENSE_DEPENDENCIES[defKey];
  if (!dep?.requires) return [];
  const names: string[] = [];
  for (const [reqKey, reqVal] of Object.entries(dep.requires)) {
    const have = game.defenses[reqKey] || 0;
    const needed = reqVal === 'level' ? ownedLevel : reqVal === 'level+1' ? ownedLevel + 1 : reqVal;
    if (have < needed) {
      const name = DEFENSES[reqKey]?.name;
      if (name) names.push(name);
    }
  }
  return names;
}

function workingLine(opts: {
  setbackText?: string;
  alertOverload: boolean;
  owned: number;
  working: number;
  missing: string[];
}): string {
  const { setbackText, alertOverload, owned, working, missing } = opts;
  const effect = working === 0 ? 'Not stopping attacks this quarter.' : 'Runs one level weaker this quarter.';
  if (setbackText && alertOverload) {
    return `${setbackText} Also more alerts than staff can handle. ${effect} Hire staff.`;
  }
  if (setbackText) return `${setbackText} ${effect}`;
  if (alertOverload) {
    return working === 0
      ? 'More alerts than staff can handle. Not stopping attacks this quarter. Hire Security Staff.'
      : 'More alerts than staff can handle. Runs one level weaker until you hire Security Staff.';
  }
  if (missing.length > 0) {
    return `Needs ${missing.join(', ')}. Only ${working} of ${owned} ${owned === 1 ? 'is' : 'are'} working.`;
  }
  return `Only ${working} of ${owned} ${owned === 1 ? 'is' : 'are'} working.`;
}

function dotShade(i: number, owned: number, pending: number, cap: number, rmAligned: boolean): string {
  const stacked = owned + pending;
  if (rmAligned && stacked >= cap && i === cap - 1) return 'bg-cyan-400';
  if (i < owned) return 'bg-brand';
  if (i < stacked) return 'bg-yellow-400';
  return 'bg-muted/40';
}
