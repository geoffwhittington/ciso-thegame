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
    return <p className="text-lg text-muted-foreground">No incidents against production this quarter.</p>;
  }

  return (
    <ul className="space-y-4">
      {attacks.map((e, i) => {
        const breach = e.data.result === 'breach';
        const resultWord = e.data.result === 'blocked' ? 'Prevented' : e.data.result === 'contained' ? 'Limited' : 'Breach';
        return (
          <li
            key={i}
            className={`rounded-xl border px-4 py-4 ${
              breach ? 'border-red-500/60 bg-red-500/10 ciso-breach-banner' :
              e.data.result === 'contained' ? 'border-amber-400/50 bg-amber-400/10' :
              'border-emerald-500/40 bg-emerald-500/5'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl leading-none" aria-hidden>
                {breach ? '🚨' : e.data.result === 'contained' ? '⚠️' : '✅'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold">
                  {resultWord}: {e.data.name}
                </p>
                <p className="text-lg text-muted-foreground mt-2">{e.data.reason}</p>
                {e.data.source && (
                  <p className="text-lg text-muted-foreground mt-2">
                    <CiteLink href={e.data.sourceUrl || urlForCitation(e.data.citation || '', e.data.source)}>
                      {e.data.source}
                    </CiteLink>
                    {e.data.citation ? ` (${e.data.citation})` : ''}
                  </p>
                )}
                {e.data.coverageNote && (
                  <p className="text-lg mt-2">{e.data.coverageNote}</p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
