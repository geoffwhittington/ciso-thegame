import { CiteLink } from './CiteLink';
import { assumptionById, type AssumptionId } from '@/lib/assumptions';

export function AssumptionCard({ id }: { id: AssumptionId }) {
  const a = assumptionById(id);
  if (!a) return null;
  const paired = a.citations.length === a.basis.length;
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-muted/25">
      <h3 className="bg-[#12294d] border-b-2 border-brand px-3.5 py-2 text-sm font-semibold leading-snug text-white">
        {a.title}
      </h3>
      <div className="p-3.5 space-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">In this simulation</p>
          <p className="text-sm mt-1 leading-relaxed">{a.mechanic}</p>
        </div>
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Published basis</p>
          {paired ? a.citations.map((c, i) => (
            <div key={c.url + i} className="rounded-md bg-background/60 border border-border/70 px-3 py-2 space-y-1.5">
              <p className="text-sm leading-relaxed">{a.basis[i]}</p>
              <CiteLink href={c.url} className="text-sm">{c.label}</CiteLink>
            </div>
          )) : (
            <div className="rounded-md bg-background/60 border border-border/70 px-3 py-2 space-y-2">
              {a.basis.map(text => (
                <p key={text} className="text-sm leading-relaxed">{text}</p>
              ))}
              <div className="flex flex-col gap-1">
                {a.citations.map(c => (
                  <CiteLink key={c.url} href={c.url} className="text-sm">{c.label}</CiteLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
