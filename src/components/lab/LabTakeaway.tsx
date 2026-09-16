import type { runLab } from '@/lib/cisoScenarios';

type LabRows = ReturnType<typeof runLab>;

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function LabTakeaway({ data }: { data: LabRows }) {
  const fund = data.aligned;
  const noGuide = data.controlsOnly;
  const maxed = data.maxed;
  const cells: { name: string; kept: string; loss: string }[] = [];
  for (const row of [fund, noGuide, maxed]) {
    if (!row) continue;
    const t = Math.max(0.01, row.turns);
    cells.push({
      name: row.label,
      kept: pct(row.ipoRate),
      loss: `$${((row.attackCost / 1000) / t).toFixed(1)}M / q`, // breach losses, not attempts
    });
  }
  if (cells.length === 0) return null;

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="font-medium text-base mb-2">This run</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        {cells.map(c => (
          <div key={c.name} className="rounded-md bg-muted/40 px-3 py-2">
            <div className="font-medium">{c.name}</div>
            <div className="text-muted-foreground">Kept job {c.kept}</div>
            <div className="text-muted-foreground">Breach loss {c.loss}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
