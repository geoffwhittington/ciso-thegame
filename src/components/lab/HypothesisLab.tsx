import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DEFAULT_SIM_KNOBS, type SimKnobs } from '@/lib/simKnobs';
import { HABIT_COPY, runLab, type StrategyId } from '@/lib/cisoScenarios';
import { SOURCE_URLS } from '@/lib/sources';
import { LabBarChart, LabLineChart, LabValueChart, LabStackedCostChart, type EvidenceCite } from './LabCharts';
import { LabTakeaway } from './LabTakeaway';

// Two distinct comparisons: how you spend, or when you start.
const HABIT_IDS: StrategyId[] = ['blind', 'spray', 'controlsOnly', 'aligned', 'maxed'];
const TIMING_IDS: StrategyId[] = ['aligned', 'alignedLate', 'alignedTooLate'];
const MODES = {
  habits: { label: 'Spending habits', ids: HABIT_IDS, defaultPick: ['controlsOnly', 'aligned', 'maxed'] as StrategyId[] },
  timing: { label: 'When you start', ids: TIMING_IDS, defaultPick: TIMING_IDS },
} as const;
type CompareMode = keyof typeof MODES;

// Published evidence each graph is calibrated to (see src/lib/guidanceEvidence.ts).
const CITE = {
  sdl: { label: 'Howard, MS SDL 2005', url: SOURCE_URLS['Microsoft SDL'] } as EvidenceCite,
  lipner: { label: 'Lipner, ACSAC 2004', url: SOURCE_URLS['Microsoft / ACSAC'] } as EvidenceCite,
  ibm: { label: 'IBM Cost of a Data Breach 2024', url: SOURCE_URLS['IBM Cost of a Data Breach 2024'] } as EvidenceCite,
  nist: { label: 'NIST / SEI defect-cost', url: SOURCE_URLS['NIST / SEI'] } as EvidenceCite,
};

// Mirrors GameEngine.getRoleLabel / getWinLabel so the lab speaks the same language as the game.
const SCENARIOS = [
  { turns: 3, role: 'Interim CISO', goal: 'interim assignment' },
  { turns: 8, role: 'CISO, Series B', goal: 'Series B' },
  { turns: 20, role: 'CISO, IPO path', goal: 'IPO' },
] as const;

type LabRows = ReturnType<typeof runLab>;

export function HypothesisLab() {
  const [seeds, setSeeds] = useState(8);
  const [horizon, setHorizon] = useState(20);
  const [knobs, setKnobs] = useState<SimKnobs>({ ...DEFAULT_SIM_KNOBS });
  const [mode, setMode] = useState<CompareMode>('habits');
  const [picked, setPicked] = useState<StrategyId[]>([...MODES.habits.defaultPick]);

  const switchMode = (m: CompareMode) => {
    setMode(m);
    setPicked([...MODES[m].defaultPick]);
  };
  const [data, setData] = useState<LabRows | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: keyof SimKnobs, v: number) => setKnobs(prev => ({ ...prev, [k]: v }));

  // In timing mode we always chart the chosen start against the day-one baseline.
  const runIds: StrategyId[] = mode === 'timing'
    ? Array.from(new Set<StrategyId>(['aligned', ...picked]))
    : picked;

  const run = () => {
    if (runIds.length === 0) return;
    setBusy(true);
    setErr('');
    window.setTimeout(() => {
      try {
        setData(runLab(runIds, seeds, knobs, horizon));
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
        setData(null);
      }
      setBusy(false);
    }, 20);
  };

  const rows = data ? runIds.map(id => data[id]).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-background text-foreground max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-base">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">CISO · Acme Security Company</div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Simulation Lab</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            We replay the CISO job many times. You pick how they spend. Then we average what happened.
          </p>
        </div>
        <a href="#/" className="text-brand font-medium shrink-0 hover:underline underline-offset-4">Back to game</a>
      </div>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2.5">Which assignment?</h2>
        <div className="grid grid-cols-3 gap-2">
          {SCENARIOS.map(s => (
            <button
              key={s.turns}
              type="button"
              onClick={() => setHorizon(s.turns)}
              className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${horizon === s.turns ? 'bg-brand text-white border-brand' : 'border-border hover:border-brand/50'}`}
            >
              <div className="font-semibold leading-tight">{s.role}</div>
              <div className={`text-xs mt-0.5 ${horizon === s.turns ? 'text-white/80' : 'text-muted-foreground'}`}>{s.turns} quarters · {s.goal}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">What to compare</h2>
        <div className="flex gap-2 mb-3">
          {(Object.keys(MODES) as CompareMode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${mode === m ? 'bg-brand text-white border-brand' : 'border-border hover:border-brand/50'}`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>
        {mode === 'timing' && (
          <p className="text-sm text-muted-foreground mb-3">You start at one point in time — pick when, and we compare that run against starting day one.</p>
        )}
        <div className="grid sm:grid-cols-2 gap-2.5">
          {MODES[mode].ids.map(id => {
            const s = { id, ...HABIT_COPY[id] };
            const on = picked.includes(s.id);
            const single = mode === 'timing';
            const toggle = () => setPicked(p => {
              if (single) return [s.id];
              return p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id];
            });
            return (
              <button
                key={s.id}
                type="button"
                role={single ? 'radio' : undefined}
                aria-checked={single ? on : undefined}
                aria-pressed={single ? undefined : on}
                onClick={toggle}
                className={`text-left rounded-lg border p-3 transition-colors ${on ? 'border-brand bg-brand/5' : 'border-border hover:border-brand/40'}`}
              >
                <div className="flex items-start gap-2.5">
                  <span className={`mt-0.5 shrink-0 w-4 h-4 ${single ? 'rounded-full' : 'rounded'} flex items-center justify-center text-[11px] font-bold ${on ? 'bg-brand text-white' : 'border border-border'}`}>
                    {on ? (single ? '●' : '✓') : ''}
                  </span>
                  <span>
                    <span className="font-semibold">{s.label}</span>
                    <span className="block text-sm text-muted-foreground mt-0.5">{s.hint}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <Button className="h-12 px-8 text-base font-semibold" disabled={busy || runIds.length === 0} onClick={run}>
          {busy ? 'Running…' : `Run ${runIds.length} ${runIds.length === 1 ? 'strategy' : 'strategies'}`}
        </Button>
        {err && <p className="text-red-400 text-sm">{err}</p>}
      </div>

      <details className="rounded-xl border border-border bg-card p-4 sm:p-5 text-sm text-muted-foreground">
        <summary className="cursor-pointer text-base font-semibold text-foreground">More settings</summary>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <label className="block">
            <span className="font-medium text-foreground">Replays</span>
            <input type="range" min={5} max={20} value={seeds} onChange={e => setSeeds(+e.target.value)} className="w-full" />
            <span>{seeds} games each</span>
          </label>
          <label className="block">
            <span className="font-medium text-foreground">Starting reputation</span>
            <input type="range" min={40} max={100} value={knobs.startReputation} onChange={e => set('startReputation', +e.target.value)} className="w-full" />
            <span>{knobs.startReputation} / 100</span>
          </label>
          <label className="block">
            <span className="font-medium text-foreground">Cash on day one</span>
            <input type="range" min={0} max={400} step={20} value={knobs.startTreasury} onChange={e => set('startTreasury', +e.target.value)} className="w-full" />
            <span>${knobs.startTreasury}K</span>
          </label>
          <label className="block">
            <span className="font-medium text-foreground">Attack frequency</span>
            <input type="range" min={50} max={200} value={Math.round(knobs.attackRampMul * 100)} onChange={e => set('attackRampMul', +e.target.value / 100)} className="w-full" />
            <span>{knobs.attackRampMul.toFixed(2)}×</span>
          </label>
          <label className="block">
            <span className="font-medium text-foreground">How hard a breach hurts</span>
            <input type="range" min={50} max={200} value={Math.round(knobs.breachRepScale * 100)} onChange={e => set('breachRepScale', +e.target.value / 100)} className="w-full" />
            <span>{knobs.breachRepScale.toFixed(2)}×</span>
          </label>
        </div>
      </details>

      {rows.length > 0 && (
        <div className="space-y-4">
          {data && <LabTakeaway data={data} />}
          <ChartCard>
            <LabBarChart
              title="Kept the job?"
              goal="higher"
              sources={[CITE.ibm]}
              series={rows.map((r, i) => ({
                key: runIds[i],
                label: r.label,
                ipo: Math.round(r.ipoRate * 100),
                fired: Math.round(r.fireRate * 100),
              }))}
            />
          </ChartCard>
          <ChartCard>
            <LabStackedCostChart
              title="Total cost each quarter"
              subtitle="Security spend (blue) plus breach losses (red). Spending a little more on threat modeling + security requirements cuts total cost many times over."
              goal="lower"
              sources={[CITE.ibm, CITE.nist]}
              series={rows.map((r, i) => ({
                key: runIds[i],
                label: r.label,
                spend: (r.spent / 1000) / Math.max(0.01, r.turns),
                loss: (r.attackCost / 1000) / Math.max(0.01, r.turns),
              }))}
            />
          </ChartCard>
          <ChartCard>
            <LabValueChart
              title="Attacks attempted each quarter"
              subtitle="Attempts against live systems — not breaches. Most are stopped; threat modeling + security requirements shrink the surface, so fewer even arrive."
              goal="lower"
              sources={[CITE.sdl, CITE.lipner]}
              series={rows.map((r, i) => ({
                key: runIds[i],
                label: r.label,
                value: Math.round(r.attacks / Math.max(0.01, r.turns) * 10) / 10,
              }))}
            />
          </ChartCard>
          <ChartCard>
            <LabLineChart
              title="Still have a job, quarter by quarter"
              goal="higher"
              series={rows.map((r, i) => ({ key: runIds[i], label: r.label, values: r.survival }))}
            />
          </ChartCard>
          <ChartCard>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-3">Habit</th>
                    <th className="pr-3">Kept job</th>
                    <th className="pr-3">Quarters</th>
                    <th className="pr-3">Attacks/q</th>
                    <th className="pr-3">Security $/q</th>
                    <th className="pr-3">Breach loss/q</th>
                    <th>Total cost/q</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const t = Math.max(0.01, r.turns);
                    return (
                      <tr key={runIds[i]} className="border-b border-border/40">
                        <td className="py-2 pr-3 font-medium">{r.label}</td>
                        <td className="pr-3">{Math.round(r.ipoRate * 100)}%</td>
                        <td className="pr-3">{r.turns.toFixed(1)}</td>
                        <td className="pr-3">{(r.attacks / t).toFixed(1)}</td>
                        <td className="pr-3">${Math.round(r.spent / t)}K</td>
                        <td className="pr-3">${((r.attackCost / 1000) / t).toFixed(1)}M</td>
                        <td className="font-semibold">${(((r.spent + r.attackCost) / 1000) / t).toFixed(1)}M</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-4 sm:p-5">{children}</div>;
}
