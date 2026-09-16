const COLORS = ['#f15f24', '#3b82f6', '#22c55e', '#a855f7', '#eab308', '#64748b'];

type Series = { key: string; label: string; values: number[] };

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
  title, series, format = String,
}: {
  title: string;
  series: { key: string; label: string; value: number }[];
  format?: (n: number) => string;
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
      <div className="text-base font-semibold mb-1">{title}</div>
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

export function LabBarChart({ title, series }: { title: string; series: { key: string; label: string; ipo: number; fired: number }[] }) {
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
      <div className="text-base font-semibold mb-1">{title}</div>
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

export function LabLineChart({ title, series }: { title: string; series: Series[] }) {
  const w = CHART_W;
  const h = 280;
  const pad = { l: 56, r: 16, t: 16, b: 32 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const n = Math.max(2, series[0]?.values.length ?? 8);

  const path = (values: number[]) =>
    values.map((v, i) => {
      const x = pad.l + (i / (n - 1)) * innerW;
      const y = pad.t + innerH * (1 - v / 100);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');

  return (
    <div>
      <div className="text-base font-semibold mb-1">{title}</div>
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
        {series.map((s, i) => (
          <path key={s.key} d={path(s.values)} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="2.5" />
        ))}
        <text x={pad.l} y={h - 6} fontSize="12" className="fill-muted-foreground">Quarter</text>
      </svg>
      <ChartLegend items={series} />
    </div>
  );
}
