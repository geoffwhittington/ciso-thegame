import { useGame } from './GameContext';
import { GameSection } from './GameSection';

type Finding = ReturnType<ReturnType<typeof useGame>['game']['getThreatModelReport']>['findings'][number];

function FindingRow({ f }: { f: Finding }) {
  return (
    <div className="flex items-center gap-2 text-sm py-1">
      <span className="shrink-0">{f.defended ? '⚠️' : '🚨'}</span>
      <span className="font-medium truncate">{f.wkLabel}</span>
      <span className="text-muted-foreground truncate hidden sm:inline">on {f.product}</span>
      {f.nextAction && (
        <span className="ml-auto text-orange-400 text-sm shrink-0 whitespace-nowrap">
          → {f.nextAction}{f.nextActionCost !== null ? (f.nextAction === 'Implement controls' ? ` ${f.nextActionCost}h` : ` $${f.nextActionCost}K`) : ''}
        </span>
      )}
    </div>
  );
}

function FindingList({ rows }: { rows: Finding[] }) {
  const shown = rows.slice(0, 6);
  return (
    <div className="space-y-1">
      {shown.map((f, i) => <FindingRow key={`${f.product}-${f.weakness}-${i}`} f={f} />)}
      {rows.length > 6 && <div className="text-sm text-muted-foreground">+{rows.length - 6} more</div>}
    </div>
  );
}

export function AnticipatedRisks() {
  const { game } = useGame();
  const tmr = game.getThreatModelReport();

  if (tmr.level === 'none') {
    const n = game.products.active.length;
    return (
      <GameSection title="Anticipated risks" hint="no risk assessment yet" dashed>
        <p className="text-sm text-muted-foreground">
          {n === 1
            ? 'You have not assessed whether this system is vulnerable, or how likely an attack is.'
            : `You have not assessed which of these ${n} systems are vulnerable, or how likely attacks are.`}
        </p>
      </GameSection>
    );
  }

  const live = tmr.findings.filter(f => f.live);
  const later = tmr.findings.filter(f => !f.live);

  return (
    <GameSection title="Anticipated risks" hint={`${tmr.totalRisks - tmr.hiddenRisks}/${tmr.totalRisks} found${tmr.hiddenRisks > 0 ? ` · ${tmr.hiddenRisks} still guessed` : ''}`}>
      <div className="flex gap-3 text-sm text-muted-foreground">
        <span>Web/Infra: <strong className={tmr.owaspPct >= 80 ? 'text-green-400' : tmr.owaspPct >= 50 ? 'text-yellow-400' : 'text-red-400'}>{tmr.owaspPct}%</strong></span>
        <span>AI/LLM: <strong className={tmr.aiPct >= 80 ? 'text-green-400' : tmr.aiPct >= 50 ? 'text-yellow-400' : 'text-red-400'}>{tmr.aiPct}%</strong></span>
      </div>
      {tmr.canRevealMore && (
        <div className="text-sm text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 rounded px-3 py-2">
          Widen threat modeling. {tmr.hiddenRisks} risk{tmr.hiddenRisks !== 1 ? 's' : ''} still without a method.
        </div>
      )}

      <div className="space-y-3">
        <div>
          <div className="text-sm font-semibold mb-1">Can be attacked now</div>
          {live.length > 0 ? (
            <FindingList rows={live} />
          ) : (
            <div className="text-sm text-green-400">Production systems look covered.</div>
          )}
        </div>
        {later.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-1">Not live yet</div>
            <p className="text-sm text-muted-foreground mb-1">Attacks cannot land until these ship. Fix them before go-live.</p>
            <FindingList rows={later} />
          </div>
        )}
        {live.length === 0 && later.length === 0 && (
          <div className="text-sm text-green-400">All identified risks addressed.</div>
        )}
      </div>
    </GameSection>
  );
}
