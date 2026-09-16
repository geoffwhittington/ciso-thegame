const COLORS = ['#f15f24', '#3b82f6', '#22c55e', '#a855f7', '#eab308', '#64748b'];

type Series = { key: string; label: string; values: number[] };

export type EvidenceCite = { label: string; url: string };
export type Goal = 'lower' | 'higher';

function GoalBadge({ goal }: { goal: Goal }) {
  const up = goal === 'higher';
  return (
    <span className={`shrink-0 text-[11px] font-semibold rounded px-1.5 py-0.5 ${up ? 'text-emerald-300 bg-emerald-400/10' : 'text-sky-300 bg-sky-400/10'}`}>
      {up ? '↑ higher is better' : '↓ lower is better'}
    </span>
  );
}

function ChartHeader({ title, subtitle, sources, goal }: { title: string; subtitle?: string; sources?: EvidenceCite[]; goal?: Goal }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold">{title}</span>
        {goal && <GoalBadge goal={goal} />}
      </div>
      {subtitle && <div className="text-sm text-muted-foreground mt-0.5">{subtitle}</div>}
      {sources && sources.length > 0 && (
        <div className="text-xs text-muted-foreground mt-0.5">
          Calibrated to:{' '}
          {sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && ' · '}
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand underline-offset-2 hover:underline">{s.label}</a>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function labelLines(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [text];
}

function AxisCaption({ x, y, text, maxChars }: { x: number; y: number; text: string; maxChars: number }) {
  const lines = labelLines(text, maxChars);
  return (
    <text x={x} y={y} textAnchor="middle" fontSize="12" className="fill-muted-foreground">
      {lines.map((line, i) => (
        <tspan key={`${i}-${line}`} x={x} dy={i === 0 ? 0 : 14}>{line}</tspan>
      ))}
    </text>
  );
}

function ChartLegend({ items }: { items: { key: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
      {items.map((s, i) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

function bottomPad(series: { label: string }[], maxChars: number) {
  return 22 + 14 * Math.max(1, ...series.map(s => labelLines(s.label, maxChars).length));
}

const CHART_W = 1100;

export function LabValueChart({
  title, subtitle, series, format = String, sources, goal,
}: {
  title: string;
  subtitle?: string;
  series: { key: string; label: string; value: number }[];
  format?: (n: number) => string;
  sources?: EvidenceCite[];
  goal?: Goal;
}) {
  const w = CHART_W;
  const innerW = w - 64 - 16;
  const groupW = innerW / Math.max(1, series.length);
  const maxChars = Math.max(14, Math.floor(groupW / 7));
  const pad = { l: 64, r: 16, t: 24, b: bottomPad(series, maxChars) };
  const h = 220 + pad.b;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(1, ...series.map(s => s.value));
  const barW = Math.min(72, groupW * 0.45);

  return (
    <div>
      <ChartHeader title={title} subtitle={subtitle} sources={sources} goal={goal} />
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label={title}>
        {[0, 0.5, 1].map(frac => {
          const y = pad.t + innerH * (1 - frac);
          const tick = Math.round(max * frac * 10) / 10;
          return (
            <g key={frac}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="currentColor" opacity={0.12} />
              <text x={pad.l - 6} y={y + 4} textAnchor="end" className="fill-muted-foreground" fontSize="12">{format(tick)}</text>
            </g>
          );
        })}
        {series.map((s, i) => {
          const cx = pad.l + groupW * i + groupW / 2;
          const barH = (s.value / max) * innerH;
          return (
            <g key={s.key}>
              <rect x={cx - barW / 2} y={pad.t + innerH - barH} width={barW} height={barH} fill={COLORS[i % COLORS.length]} />
              <text x={cx} y={pad.t + innerH - barH - 6} textAnchor="middle" fontSize="12" className="fill-foreground">{format(s.value)}</text>
              <AxisCaption x={cx} y={pad.t + innerH + 18} text={s.label} maxChars={maxChars} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function LabStackedCostChart({
  title, subtitle, series, sources, goal,
}: {
  title: string;
  subtitle?: string;
  series: { key: string; label: string; spend: number; loss: number }[]; // $M per quarter
  sources?: EvidenceCite[];
  goal?: Goal;
}) {
  const w = CHART_W;
  const innerW = w - 64 - 16;
  const groupW = innerW / Math.max(1, series.length);
  const maxChars = Math.max(14, Math.floor(groupW / 7));
  const pad = { l: 64, r: 16, t: 24, b: bottomPad(series, maxChars) };
  const h = 220 + pad.b;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(0.1, ...series.map(s => s.spend + s.loss));
  const barW = Math.min(72, groupW * 0.45);
  const fmt = (n: number) => `$${Math.round(n * 10) / 10}M`;

  return (
    <div>
      <ChartHeader title={title} subtitle={subtitle} sources={sources} goal={goal} />
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label={title}>
        {[0, 0.5, 1].map(frac => {
          const y = pad.t + innerH * (1 - frac);
          return (
            <g key={frac}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="currentColor" opacity={0.12} />
              <text x={pad.l - 6} y={y + 4} textAnchor="end" className="fill-muted-foreground" fontSize="12">{fmt(max * frac)}</text>
            </g>
          );
        })}
        {series.map((s, i) => {
          const cx = pad.l + groupW * i + groupW / 2;
          const total = s.spend + s.loss;
          const lossH = (s.loss / max) * innerH;
          const spendH = (s.spend / max) * innerH;
          const base = pad.t + innerH;
          return (
            <g key={s.key}>
              {/* breach losses (bottom, red) */}
              <rect x={cx - barW / 2} y={base - lossH} width={barW} height={lossH} fill="#ef4444" />
              {/* security spend (top, blue) */}
              <rect x={cx - barW / 2} y={base - lossH - spendH} width={barW} height={spendH} fill="#3b82f6" />
              <text x={cx} y={base - lossH - spendH - 6} textAnchor="middle" fontSize="12" className="fill-foreground">{fmt(total)}</text>
              <AxisCaption x={cx} y={base + 18} text={s.label} maxChars={maxChars} />
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500 mr-1.5 align-middle" /> Security spend</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500 mr-1.5 align-middle" /> Breach losses</span>
      </div>
    </div>
  );
}

export function LabBarChart({ title, subtitle, series, sources, goal }: { title: string; subtitle?: string; series: { key: string; label: string; ipo: number; fired: number }[]; sources?: EvidenceCite[]; goal?: Goal }) {
  const w = CHART_W;
  const innerW = w - 56 - 16;
  const groupW = innerW / Math.max(1, series.length);
  const maxChars = Math.max(14, Math.floor(groupW / 7));
  const pad = { l: 56, r: 16, t: 16, b: bottomPad(series, maxChars) };
  const h = 220 + pad.b;
  const innerH = h - pad.t - pad.b;
  const barW = Math.min(36, groupW / 3.2);

  return (
    <div>
      <ChartHeader title={title} subtitle={subtitle} sources={sources} goal={goal} />
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label={title}>
        {[0, 50, 100].map(tick => {
          const y = pad.t + innerH * (1 - tick / 100);
          return (
            <g key={tick}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="currentColor" opacity={0.12} />
              <text x={pad.l - 6} y={y + 4} textAnchor="end" className="fill-muted-foreground" fontSize="12">{tick}%</text>
            </g>
          );
        })}
        {series.map((s, i) => {
          const cx = pad.l + groupW * i + groupW / 2;
          const ipoH = (s.ipo / 100) * innerH;
          const fireH = (s.fired / 100) * innerH;
          return (
            <g key={s.key}>
              <rect x={cx - barW - 2} y={pad.t + innerH - ipoH} width={barW} height={ipoH} fill="#22c55e" />
              <rect x={cx + 2} y={pad.t + innerH - fireH} width={barW} height={fireH} fill="#f15f24" />
              <AxisCaption x={cx} y={pad.t + innerH + 18} text={s.label} maxChars={maxChars} />
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500 mr-1.5 align-middle" /> Kept the job</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-orange-500 mr-1.5 align-middle" /> Fired</span>
      </div>
    </div>
  );
}

export function LabLineChart({ title, subtitle, series, sources, goal }: { title: string; subtitle?: string; series: Series[]; sources?: EvidenceCite[]; goal?: Goal }) {
  const w = CHART_W;
  const h = 280;
  const pad = { l: 56, r: 16, t: 16, b: 32 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const n = Math.max(2, series[0]?.values.length ?? 8);

  // Nudge each series by a small vertical offset so lines sitting on the same
  // value (e.g. everyone at 100%) stay visible instead of hiding under the last.
  const offset = (i: number) => (i - (series.length - 1) / 2) * 3;
  const pointsOf = (values: number[], i: number) =>
    values.map((v, j) => ({
      x: pad.l + (j / (n - 1)) * innerW,
      y: pad.t + innerH * (1 - v / 100) + offset(i),
    }));
  const path = (values: number[], i: number) =>
    pointsOf(values, i).map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <div>
      <ChartHeader title={title} subtitle={subtitle} sources={sources} goal={goal} />
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label={title}>
        {[0, 50, 100].map(tick => {
          const y = pad.t + innerH * (1 - tick / 100);
          return (
            <g key={tick}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="currentColor" opacity={0.12} />
              <text x={pad.l - 6} y={y + 4} textAnchor="end" className="fill-muted-foreground" fontSize="12">{tick}%</text>
            </g>
          );
        })}
        {series.map((s, i) => {
          const color = COLORS[i % COLORS.length];
          return (
            <g key={s.key}>
              <path d={path(s.values, i)} fill="none" stroke={color} strokeWidth="2.5" />
              {pointsOf(s.values, i).map((p, j) => (
                <circle key={j} cx={p.x} cy={p.y} r={3.5} fill={color} stroke="var(--background, #0b1220)" strokeWidth="1.5" />
              ))}
            </g>
          );
        })}
        <text x={pad.l} y={h - 6} fontSize="12" className="fill-muted-foreground">Quarter</text>
      </svg>
      <ChartLegend items={series} />
    </div>
  );
}
