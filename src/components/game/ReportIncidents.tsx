import { urlForCitation } from '@/lib/sources';
import { CiteLink } from './CiteLink';

type AttackEntry = {
  data: {
    result: string;
    name: string;
    reason: string;
    source?: string;
    sourceUrl?: string;
    citation?: string;
    blindSpot?: boolean;
    coverageNote?: string;
  };
};

export function ReportIncidents({
  attacks,
}: {
  attacks: AttackEntry[];
}) {
  if (attacks.length === 0) {
    return <p className="text-sm text-muted-foreground">No incidents against production this quarter.</p>;
  }

  return (
    <ul className="space-y-2">
      {attacks.map((e, i) => {
        const breach = e.data.result === 'breach';
        const resultWord = e.data.result === 'blocked' ? 'Prevented' : e.data.result === 'contained' ? 'Limited' : 'Breach';
        return (
          <li
            key={i}
            className={`rounded-lg border px-3 py-2.5 ${
              breach ? 'border-red-500/60 bg-red-500/10 ciso-breach-banner' :
              e.data.result === 'contained' ? 'border-amber-400/50 bg-amber-400/10' :
              'border-emerald-500/40 bg-emerald-500/5'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-lg leading-none mt-0.5" aria-hidden>
                {breach ? '🚨' : e.data.result === 'contained' ? '⚠️' : '✅'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {resultWord}: {e.data.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{e.data.reason}</p>
                {e.data.source && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <CiteLink href={e.data.sourceUrl || urlForCitation(e.data.citation || '', e.data.source)}>
                      {e.data.source}
                    </CiteLink>
                    {e.data.citation ? ` (${e.data.citation})` : ''}
                  </p>
                )}
                {e.data.coverageNote && (
                  <p className="text-sm mt-1">{e.data.coverageNote}</p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
