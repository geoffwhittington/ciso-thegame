import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DEFAULT_SIM_KNOBS, type SimKnobs } from '@/lib/simKnobs';
import { HABIT_COPY, runLab, type StrategyId } from '@/lib/cisoScenarios';
import { LabBarChart, LabLineChart, LabValueChart } from './LabCharts';
import { LabTakeaway } from './LabTakeaway';

const ALL = (Object.keys(HABIT_COPY) as StrategyId[]).map(id => ({ id, ...HABIT_COPY[id] }));

type LabRows = ReturnType<typeof runLab>;

export function HypothesisLab() {
  const [seeds, setSeeds] = useState(8);
  const [horizon, setHorizon] = useState(8);
  const [knobs, setKnobs] = useState<SimKnobs>({ ...DEFAULT_SIM_KNOBS });
  const [picked, setPicked] = useState<StrategyId[]>(['controlsOnly', 'aligned', 'maxed']);
  const [data, setData] = useState<LabRows | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: keyof SimKnobs, v: number) => setKnobs(prev => ({ ...prev, [k]: v }));

  const run = () => {
    if (picked.length === 0) return;
    setBusy(true);
    setErr('');
    window.setTimeout(() => {
      try {
        setData(runLab(picked, seeds, knobs, horizon));
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
        setData(null);
      }
      setBusy(false);
    }, 20);
  };

  const rows = data ? picked.map(id => data[id]).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-background text-foreground max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-8 text-base">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Simulation Lab</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            We replay the CISO job many times. You pick how they spend. Then we average what happened.
          </p>
        </div>
        <a href="#/" className="text-orange-400 shrink-0">Back to game</a>
      </div>

      <div>
        <div className="font-medium mb-2">How long?</div>
        <div className="flex gap-2">
          {([8, 20] as const).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setHorizon(n)}
              className={`px-4 py-2 rounded-md border text-base ${horizon === n ? 'bg-orange-500 text-white border-orange-500' : 'border-border'}`}
            >
              {n} quarters
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">Who to compare</div>
        <div className="space-y-3">
          {ALL.map(s => (
            <label key={s.id} className="flex items-start gap-3">
              <input
                className="mt-1.5 h-4 w-4"
                type="checkbox"
                checked={picked.includes(s.id)}
                onChange={() => setPicked(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])}
              />
              <span>
                <span className="font-medium">{s.label}</span>
                <span className="text-muted-foreground"> — {s.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <Button className="bg-orange-500 hover:bg-orange-600 text-white text-base px-6 py-5" disabled={busy || picked.length === 0} onClick={run}>
        {busy ? 'Running…' : 'Run'}
      </Button>
      {err && <p className="text-red-400">{err}</p>}

      <details className="text-sm text-muted-foreground">
        <summary className="cursor-pointer text-base text-foreground">More settings</summary>
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
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
        <div className="space-y-8">
          {data && <LabTakeaway data={data} />}
          <LabBarChart
            title="Kept the job?"
            series={rows.map((r, i) => ({
              key: picked[i],
              label: r.label,
              ipo: Math.round(r.ipoRate * 100),
              fired: Math.round(r.fireRate * 100),
            }))}
          />
          <LabValueChart
            title="Attack $ each quarter"
            format={n => `$${n}M`}
            series={rows.map((r, i) => ({
              key: picked[i],
              label: r.label,
              value: Math.round((r.attackCost / 1000) / Math.max(0.01, r.turns) * 10) / 10,
            }))}
          />
          <LabValueChart
            title="Attacks each quarter"
            series={rows.map((r, i) => ({
              key: picked[i],
              label: r.label,
              value: Math.round(r.attacks / Math.max(0.01, r.turns) * 10) / 10,
            }))}
          />
          <LabValueChart
            title="Security $ each quarter"
            format={n => `$${n}K`}
            series={rows.map((r, i) => ({
              key: picked[i],
              label: r.label,
              value: Math.round(r.spent / Math.max(0.01, r.turns)),
            }))}
          />
          <LabLineChart
            title="Still have a job, quarter by quarter"
            series={rows.map((r, i) => ({ key: picked[i], label: r.label, values: r.survival }))}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3">Habit</th>
                  <th className="pr-3">Kept job</th>
                  <th className="pr-3">Quarters</th>
                  <th className="pr-3">Attacks/q</th>
                  <th className="pr-3">Security $/q</th>
                  <th>Attack $/q</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={picked[i]} className="border-b border-border/40">
                    <td className="py-2 pr-3">{r.label}</td>
                    <td className="pr-3">{Math.round(r.ipoRate * 100)}%</td>
                    <td className="pr-3">{r.turns.toFixed(1)}</td>
                    <td className="pr-3">{(r.attacks / Math.max(0.01, r.turns)).toFixed(1)}</td>
                    <td className="pr-3">${Math.round(r.spent / Math.max(0.01, r.turns))}K</td>
                    <td>${((r.attackCost / 1000) / Math.max(0.01, r.turns)).toFixed(1)}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
